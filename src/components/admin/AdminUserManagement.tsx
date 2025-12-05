import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, UserCog, Shield, ShieldOff, Ban, CheckCircle, Plus, X, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  is_prime_member: boolean;
  loyalty_points: number;
  wallet_balance: number;
  account_status: string;
  block_reason: string | null;
  roles: string[];
}

const ALL_ROLES = ["customer", "merchant", "rider", "admin", "super_admin"] as const;

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleAction, setRoleAction] = useState<{ type: "add" | "remove"; role: string } | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");

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
        phone: profile.phone || "N/A",
        created_at: profile.created_at,
        is_prime_member: profile.is_prime_member || false,
        loyalty_points: profile.loyalty_points || 0,
        wallet_balance: profile.wallet_balance || 0,
        account_status: profile.account_status || "active",
        block_reason: profile.block_reason,
        roles: rolesMap[profile.id] || [],
      })) || [];

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = (user: User, role: string) => {
    setSelectedUser(user);
    setRoleAction({ type: "add", role });
    setShowRoleDialog(true);
  };

  const handleRemoveRole = (user: User, role: string) => {
    setSelectedUser(user);
    setRoleAction({ type: "remove", role });
    setShowRoleDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !roleAction) return;

    try {
      if (roleAction.type === "add") {
        const { error } = await supabase
          .from("user_roles")
          .insert({
            user_id: selectedUser.id,
            role: roleAction.role as "admin" | "customer" | "merchant" | "rider" | "super_admin",
          });

        if (error) throw error;
        toast.success(`Added ${roleAction.role} role to ${selectedUser.full_name}`);
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", selectedUser.id)
          .eq("role", roleAction.role as "admin" | "customer" | "merchant" | "rider" | "super_admin");

        if (error) throw error;
        toast.success(`Removed ${roleAction.role} role from ${selectedUser.full_name}`);
      }

      setShowRoleDialog(false);
      setSelectedUser(null);
      setRoleAction(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast.error(error.message || "Failed to change role");
    }
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setBlockReason("");
    setShowBlockDialog(true);
  };

  const confirmBlockUser = async () => {
    if (!selectedUser) return;

    try {
      const isBlocking = selectedUser.account_status === "active";
      
      const { error } = await supabase
        .from("profiles")
        .update({
          account_status: isBlocking ? "blocked" : "active",
          block_reason: isBlocking ? blockReason : null,
          blocked_at: isBlocking ? new Date().toISOString() : null,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success(isBlocking 
        ? `${selectedUser.full_name} has been blocked` 
        : `${selectedUser.full_name} has been unblocked`
      );
      setShowBlockDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleWalletAdjust = (user: User) => {
    setSelectedUser(user);
    setWalletAmount("");
    setShowWalletDialog(true);
  };

  const confirmWalletAdjust = async () => {
    if (!selectedUser || !walletAmount) return;

    try {
      const amount = parseFloat(walletAmount);
      const newBalance = selectedUser.wallet_balance + amount;

      const { error } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Record the transaction
      await supabase.from("wallet_transactions").insert({
        user_id: selectedUser.id,
        amount: amount,
        transaction_type: amount > 0 ? "credit" : "debit",
        description: `Admin adjustment: ${amount > 0 ? "+" : ""}${amount} MAD`,
      });

      toast.success(`Wallet adjusted for ${selectedUser.full_name}`);
      setShowWalletDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error adjusting wallet:", error);
      toast.error(error.message || "Failed to adjust wallet");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin": return "destructive";
      case "admin": return "default";
      case "merchant": return "secondary";
      case "rider": return "outline";
      default: return "secondary";
    }
  };

  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.id.includes(searchTerm)
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.roles.includes("admin") || u.roles.includes("super_admin")).length,
    merchants: users.filter(u => u.roles.includes("merchant")).length,
    riders: users.filter(u => u.roles.includes("rider")).length,
    blocked: users.filter(u => u.account_status === "blocked").length,
    prime: users.filter(u => u.is_prime_member).length,
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">User Management</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.admins}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.merchants}</div>
            <div className="text-sm text-muted-foreground">Merchants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.riders}</div>
            <div className="text-sm text-muted-foreground">Riders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.blocked}</div>
            <div className="text-sm text-muted-foreground">Blocked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.prime}</div>
            <div className="text-sm text-muted-foreground">Prime</div>
          </CardContent>
        </Card>
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
                <TableHead>Wallet</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className={user.account_status === "blocked" ? "bg-red-50 dark:bg-red-950/20" : ""}>
                  <TableCell className="font-medium">
                    {user.full_name}
                    {user.is_prime_member && (
                      <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">Prime</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge 
                          key={role} 
                          variant={getRoleBadgeVariant(role)}
                          className="cursor-pointer"
                          onClick={() => handleRemoveRole(user, role)}
                        >
                          {role}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Add Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ALL_ROLES.filter(r => !user.roles.includes(r)).map((role) => (
                            <DropdownMenuItem key={role} onClick={() => handleAddRole(user, role)}>
                              {role}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.account_status === "active" ? "secondary" : "destructive"}>
                      {user.account_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.wallet_balance.toFixed(2)} MAD</TableCell>
                  <TableCell>{user.loyalty_points}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleWalletAdjust(user)}>
                          <Wallet className="h-4 w-4 mr-2" />
                          Adjust Wallet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.account_status === "active" ? (
                          <DropdownMenuItem 
                            onClick={() => handleBlockUser(user)}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Block User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleBlockUser(user)}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unblock User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Role Change Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {roleAction?.type === "add" ? "Add Role" : "Remove Role"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {roleAction?.type} the <strong>{roleAction?.role}</strong> role 
              {roleAction?.type === "add" ? " to " : " from "} 
              <strong>{selectedUser?.full_name}</strong>?
              {roleAction?.role === "admin" && (
                <span className="block mt-2 text-amber-600">
                  Warning: Admin role grants full platform access.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              {roleAction?.type === "add" ? "Add Role" : "Remove Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.account_status === "active" ? "Block User" : "Unblock User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.account_status === "active" 
                ? `Blocking ${selectedUser?.full_name} will prevent them from placing orders.`
                : `Unblocking ${selectedUser?.full_name} will restore their account access.`
              }
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.account_status === "active" && (
            <div className="space-y-2">
              <Label htmlFor="blockReason">Reason for blocking</Label>
              <Textarea
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Cancel</Button>
            <Button 
              variant={selectedUser?.account_status === "active" ? "destructive" : "default"}
              onClick={confirmBlockUser}
            >
              {selectedUser?.account_status === "active" ? "Block User" : "Unblock User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet Adjustment Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Wallet Balance</DialogTitle>
            <DialogDescription>
              Current balance: {selectedUser?.wallet_balance.toFixed(2)} MAD
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="walletAmount">Amount (use negative to deduct)</Label>
            <Input
              id="walletAmount"
              type="number"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              placeholder="e.g., 50 or -20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalletDialog(false)}>Cancel</Button>
            <Button onClick={confirmWalletAdjust}>Adjust Balance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;