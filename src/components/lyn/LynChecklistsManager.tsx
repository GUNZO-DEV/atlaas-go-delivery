import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, Sun, Moon, Sparkles, Package, Plus, 
  Check, X, Clock, Edit, Trash2 
} from "lucide-react";
import { format } from "date-fns";

interface LynChecklistsManagerProps {
  restaurant: any;
}

const defaultChecklists = {
  opening: [
    "Turn on lights and AC",
    "Check refrigeration temperatures",
    "Prepare coffee station",
    "Set up tables and chairs",
    "Review reservations for the day",
    "Check inventory levels",
    "Brief staff on specials"
  ],
  closing: [
    "Clear and clean all tables",
    "Run final sales report",
    "Count cash drawer",
    "Clean kitchen surfaces",
    "Store food properly",
    "Turn off equipment",
    "Lock all doors",
    "Set alarm"
  ],
  cleaning: [
    "Sweep and mop floors",
    "Clean restrooms",
    "Wipe down all surfaces",
    "Empty trash bins",
    "Clean windows",
    "Sanitize door handles"
  ],
  inventory: [
    "Count meat inventory",
    "Count vegetable inventory",
    "Check dairy expiration",
    "Count beverages",
    "Check cleaning supplies",
    "Note low stock items"
  ]
};

const LynChecklistsManager = ({ restaurant }: LynChecklistsManagerProps) => {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChecklist, setActiveChecklist] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [staffName, setStaffName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [newChecklistType, setNewChecklistType] = useState("opening");
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [checklistsRes, completionsRes] = await Promise.all([
        supabase
          .from("lyn_checklists")
          .select("*")
          .eq("restaurant_id", restaurant.id),
        supabase
          .from("lyn_checklist_completions")
          .select("*, lyn_checklists(name, type)")
          .eq("restaurant_id", restaurant.id)
          .gte("completion_date", format(new Date(), "yyyy-MM-dd"))
          .order("created_at", { ascending: false })
      ]);

      let checklistData = checklistsRes.data || [];
      
      // Create default checklists if none exist
      if (checklistData.length === 0) {
        const defaults = [
          { name: "Opening Checklist", type: "opening", items: defaultChecklists.opening },
          { name: "Closing Checklist", type: "closing", items: defaultChecklists.closing },
          { name: "Cleaning Checklist", type: "cleaning", items: defaultChecklists.cleaning },
          { name: "Inventory Checklist", type: "inventory", items: defaultChecklists.inventory }
        ];

        for (const def of defaults) {
          await supabase.from("lyn_checklists").insert({
            restaurant_id: restaurant.id,
            name: def.name,
            type: def.type,
            items: def.items
          });
        }

        const { data } = await supabase
          .from("lyn_checklists")
          .select("*")
          .eq("restaurant_id", restaurant.id);
        checklistData = data || [];
      }

      setChecklists(checklistData);
      setCompletions(completionsRes.data || []);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const startChecklist = (checklist: any) => {
    setActiveChecklist(checklist);
    setCheckedItems([]);
    setStaffName("");
  };

  const toggleItem = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const completeChecklist = async () => {
    if (!staffName) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }

    const items = activeChecklist.items as string[];
    if (checkedItems.length < items.length) {
      if (!confirm(`You have ${items.length - checkedItems.length} unchecked items. Complete anyway?`)) return;
    }

    try {
      const { error } = await supabase.from("lyn_checklist_completions").insert({
        restaurant_id: restaurant.id,
        checklist_id: activeChecklist.id,
        completed_by: staffName,
        completion_date: format(new Date(), "yyyy-MM-dd"),
        items_completed: checkedItems
      });

      if (error) throw error;
      toast({ title: "Checklist Completed!" });
      setActiveChecklist(null);
      setCheckedItems([]);
      setStaffName("");
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const createChecklist = async () => {
    if (!newChecklistName || newChecklistItems.length === 0) {
      toast({ title: "Please add name and items", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("lyn_checklists").insert({
        restaurant_id: restaurant.id,
        name: newChecklistName,
        type: newChecklistType,
        items: newChecklistItems
      });

      if (error) throw error;
      toast({ title: "Checklist Created" });
      setCreateDialogOpen(false);
      setNewChecklistName("");
      setNewChecklistType("opening");
      setNewChecklistItems([]);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addNewItem = () => {
    if (newItemText.trim()) {
      setNewChecklistItems([...newChecklistItems, newItemText.trim()]);
      setNewItemText("");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "opening": return <Sun className="h-5 w-5 text-yellow-600" />;
      case "closing": return <Moon className="h-5 w-5 text-purple-600" />;
      case "cleaning": return <Sparkles className="h-5 w-5 text-blue-600" />;
      case "inventory": return <Package className="h-5 w-5 text-green-600" />;
      default: return <ClipboardList className="h-5 w-5" />;
    }
  };

  const isCompletedToday = (checklistId: string) => {
    return completions.some(c => c.checklist_id === checklistId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeChecklist) {
    const items = activeChecklist.items as string[];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(activeChecklist.type)}
            <div>
              <h2 className="text-2xl font-bold">{activeChecklist.name}</h2>
              <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setActiveChecklist(null)}>
            <X className="h-4 w-4 mr-2" />Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {checkedItems.length} / {items.length} completed
                </span>
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(checkedItems.length / items.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      checkedItems.includes(item) 
                        ? "bg-green-50 dark:bg-green-900/20" 
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => toggleItem(item)}
                  >
                    <Checkbox 
                      checked={checkedItems.includes(item)}
                      onCheckedChange={() => toggleItem(item)}
                    />
                    <span className={checkedItems.includes(item) ? "line-through text-muted-foreground" : ""}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <Label>Your Name *</Label>
                  <Input
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <Button onClick={completeChecklist} className="w-full" size="lg">
                  <Check className="h-4 w-4 mr-2" />
                  Complete Checklist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Operations Checklists</h2>
          <p className="text-muted-foreground">Daily opening, closing, and inventory checklists</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Checklist</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Checklist</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newChecklistName}
                    onChange={(e) => setNewChecklistName(e.target.value)}
                    placeholder="Checklist name"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newChecklistType} onValueChange={setNewChecklistType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opening">Opening</SelectItem>
                      <SelectItem value="closing">Closing</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Items</Label>
                <div className="flex gap-2">
                  <Input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add checklist item"
                    onKeyPress={(e) => e.key === "Enter" && addNewItem()}
                  />
                  <Button onClick={addNewItem} type="button">Add</Button>
                </div>
                {newChecklistItems.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {newChecklistItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                        <span>{item}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setNewChecklistItems(newChecklistItems.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={createChecklist} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Progress - {format(new Date(), "MMMM d")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {checklists.map(checklist => {
              const completed = isCompletedToday(checklist.id);
              return (
                <div 
                  key={checklist.id}
                  className={`p-4 rounded-lg border-2 ${
                    completed 
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20" 
                      : "border-dashed border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(checklist.type)}
                    <span className="font-medium text-sm">{checklist.name}</span>
                  </div>
                  {completed ? (
                    <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Done</Badge>
                  ) : (
                    <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Checklists Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {checklists.map(checklist => {
          const items = checklist.items as string[];
          const completed = isCompletedToday(checklist.id);
          const todayCompletion = completions.find(c => c.checklist_id === checklist.id);

          return (
            <Card key={checklist.id} className={completed ? "border-green-300" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {getTypeIcon(checklist.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{checklist.name}</h3>
                      <p className="text-sm text-muted-foreground">{items.length} items</p>
                    </div>
                  </div>
                  {completed && (
                    <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Completed</Badge>
                  )}
                </div>

                {completed && todayCompletion && (
                  <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                    <p className="text-muted-foreground">
                      Completed by <span className="font-medium">{todayCompletion.completed_by}</span> at{" "}
                      {format(new Date(todayCompletion.created_at), "h:mm a")}
                    </p>
                  </div>
                )}

                <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
                  {items.slice(0, 5).map((item, i) => (
                    <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
                      {item}
                    </div>
                  ))}
                  {items.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{items.length - 5} more items</p>
                  )}
                </div>

                <Button 
                  onClick={() => startChecklist(checklist)} 
                  className="w-full"
                  variant={completed ? "outline" : "default"}
                >
                  {completed ? "Start Again" : "Start Checklist"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LynChecklistsManager;
