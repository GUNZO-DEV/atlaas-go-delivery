import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, Ban, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BlockUserDialog } from "./BlockUserDialog";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  is_prime_member: boolean;
  loyalty_points: number;
  roles: string[];
  account_status: string;
  block_reason: string | null;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for all users
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap: Record<string, string[]> = {};
      rolesData?.forEach((r) => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });

      const usersWithDetails = profilesData?.map((profile) => ({
        id: profile.id,
        full_name: profile.full_name || "N/A",
        email: profile.id.slice(0, 8) + "...", // Show user ID instead of email for privacy
        phone: profile.phone || "N/A",
        created_at: profile.created_at,
        is_prime_member: profile.is_prime_member,
        loyalty_points: profile.loyalty_points,
        roles: rolesMap[profile.id] || [],
        account_status: profile.account_status || "active",
        block_reason: profile.block_reason,
      })) || [];

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.id.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {users.length} total users
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prime</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.account_status === "blocked" ? "destructive" : "default"}>
                      {user.account_status === "blocked" ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_prime_member ? (
                      <Badge>Prime</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{user.loyalty_points}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={user.account_status === "blocked" ? "default" : "destructive"}
                      onClick={() => {
                        setSelectedUser(user);
                        setBlockDialogOpen(true);
                      }}
                    >
                      {user.account_status === "blocked" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <Ban className="h-3 w-3 mr-1" />
                          Block
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching your search
        </div>
      )}

      {selectedUser && (
        <BlockUserDialog
          open={blockDialogOpen}
          onOpenChange={setBlockDialogOpen}
          userId={selectedUser.id}
          userName={selectedUser.full_name}
          currentStatus={selectedUser.account_status}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;
