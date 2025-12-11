import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Users, Clock, CheckSquare, Calendar, Phone, Mail, Edit, Trash2
} from "lucide-react";
import { format } from "date-fns";

interface LynStaffManagementProps {
  restaurant: any;
}

const roles = ["Chef", "Waiter", "Cashier", "Manager", "Kitchen Helper", "Cleaner", "Other"];

const LynStaffManagement = ({ restaurant }: LynStaffManagementProps) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "Waiter",
    phone: "",
    email: "",
    hourly_rate: ""
  });
  const [newShift, setNewShift] = useState({
    staff_id: "",
    shift_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "17:00"
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    staff_id: "",
    priority: "medium",
    due_date: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, shiftsRes, tasksRes] = await Promise.all([
        supabase
          .from("lyn_staff")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("name"),
        supabase
          .from("lyn_staff_shifts")
          .select("*, lyn_staff(name)")
          .eq("restaurant_id", restaurant.id)
          .gte("shift_date", format(new Date(), "yyyy-MM-dd"))
          .order("shift_date"),
        supabase
          .from("lyn_staff_tasks")
          .select("*, lyn_staff(name)")
          .eq("restaurant_id", restaurant.id)
          .neq("status", "completed")
          .order("created_at", { ascending: false })
      ]);

      setStaff(staffRes.data || []);
      setShifts(shiftsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load staff data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStaff = async () => {
    if (!newStaff.name) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }

    try {
      const staffData = {
        restaurant_id: restaurant.id,
        name: newStaff.name,
        role: newStaff.role,
        phone: newStaff.phone || null,
        email: newStaff.email || null,
        hourly_rate: newStaff.hourly_rate ? parseFloat(newStaff.hourly_rate) : null
      };

      if (editingStaff) {
        const { error } = await supabase
          .from("lyn_staff")
          .update(staffData)
          .eq("id", editingStaff.id);
        if (error) throw error;
        toast({ title: "Staff Updated" });
      } else {
        const { error } = await supabase
          .from("lyn_staff")
          .insert(staffData);
        if (error) throw error;
        toast({ title: "Staff Added" });
      }

      resetStaffForm();
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm("Delete this staff member?")) return;
    
    try {
      const { error } = await supabase
        .from("lyn_staff")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Staff Deleted" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const saveShift = async () => {
    if (!newShift.staff_id) {
      toast({ title: "Please select a staff member", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from("lyn_staff_shifts")
        .insert({
          restaurant_id: restaurant.id,
          staff_id: newShift.staff_id,
          shift_date: newShift.shift_date,
          start_time: newShift.start_time,
          end_time: newShift.end_time
        });

      if (error) throw error;
      toast({ title: "Shift Added" });
      setNewShift({
        staff_id: "",
        shift_date: format(new Date(), "yyyy-MM-dd"),
        start_time: "09:00",
        end_time: "17:00"
      });
      setShiftDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const saveTask = async () => {
    if (!newTask.title) {
      toast({ title: "Please enter a task title", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from("lyn_staff_tasks")
        .insert({
          restaurant_id: restaurant.id,
          title: newTask.title,
          description: newTask.description || null,
          staff_id: newTask.staff_id || null,
          priority: newTask.priority,
          due_date: newTask.due_date || null
        });

      if (error) throw error;
      toast({ title: "Task Added" });
      setNewTask({ title: "", description: "", staff_id: "", priority: "medium", due_date: "" });
      setTaskDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleTaskStatus = async (task: any) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      const { error } = await supabase
        .from("lyn_staff_tasks")
        .update({ 
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null
        })
        .eq("id", task.id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetStaffForm = () => {
    setNewStaff({ name: "", role: "Waiter", phone: "", email: "", hourly_rate: "" });
    setEditingStaff(null);
    setStaffDialogOpen(false);
  };

  const editStaffMember = (member: any) => {
    setEditingStaff(member);
    setNewStaff({
      name: member.name,
      role: member.role,
      phone: member.phone || "",
      email: member.email || "",
      hourly_rate: member.hourly_rate?.toString() || ""
    });
    setStaffDialogOpen(true);
  };

  const activeStaff = staff.filter(s => s.is_active);
  const todayShifts = shifts.filter(s => s.shift_date === format(new Date(), "yyyy-MM-dd"));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff, shifts, and tasks</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CheckSquare className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Task Title *</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g., Clean kitchen"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Additional details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assign To</Label>
                    <Select 
                      value={newTask.staff_id} 
                      onValueChange={(v) => setNewTask({...newTask, staff_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {activeStaff.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(v) => setNewTask({...newTask, priority: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={saveTask} className="w-full">Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Shift</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Staff Member *</Label>
                  <Select 
                    value={newShift.staff_id} 
                    onValueChange={(v) => setNewShift({...newShift, staff_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeStaff.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newShift.shift_date}
                    onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newShift.start_time}
                      onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newShift.end_time}
                      onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={saveShift} className="w-full">Add Shift</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={staffDialogOpen} onOpenChange={(open) => { if (!open) resetStaffForm(); else setStaffDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    placeholder="Staff name"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select 
                    value={newStaff.role} 
                    onValueChange={(v) => setNewStaff({...newStaff, role: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                      placeholder="+212..."
                    />
                  </div>
                  <div>
                    <Label>Hourly Rate (DH)</Label>
                    <Input
                      type="number"
                      value={newStaff.hourly_rate}
                      onChange={(e) => setNewStaff({...newStaff, hourly_rate: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <Button onClick={saveStaff} className="w-full">
                  {editingStaff ? "Update Staff" : "Add Staff"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
                <p className="text-xl font-bold">{activeStaff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Shifts</p>
                <p className="text-xl font-bold">{todayShifts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-xl font-bold">{tasks.filter(t => t.status === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Shifts</p>
                <p className="text-xl font-bold">{shifts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff ({activeStaff.length})</TabsTrigger>
          <TabsTrigger value="shifts">Shifts ({shifts.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          {activeStaff.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No staff members yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeStaff.map(member => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => editStaffMember(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteStaff(member.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {member.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </p>
                      )}
                      {member.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </p>
                      )}
                      {member.hourly_rate && (
                        <p className="font-medium text-foreground">
                          {Number(member.hourly_rate).toFixed(0)} DH/hour
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          {shifts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming shifts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {shifts.map(shift => (
                <Card key={shift.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{shift.lyn_staff?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(shift.shift_date), "EEE, MMM d")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{shift.start_time} - {shift.end_time}</p>
                      <Badge variant={shift.shift_date === format(new Date(), "yyyy-MM-dd") ? "default" : "outline"}>
                        {shift.shift_date === format(new Date(), "yyyy-MM-dd") ? "Today" : "Upcoming"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <Card key={task.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => toggleTaskStatus(task)}
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        {task.lyn_staff?.name && <span>{task.lyn_staff.name}</span>}
                        <Badge 
                          variant="outline"
                          className={
                            task.priority === "high" ? "border-red-500 text-red-600" :
                            task.priority === "medium" ? "border-yellow-500 text-yellow-600" :
                            "border-gray-500 text-gray-600"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LynStaffManagement;
