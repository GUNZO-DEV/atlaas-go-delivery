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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Package, AlertTriangle, Search, Edit, Trash2,
  TrendingUp, Building2
} from "lucide-react";

interface LynInventoryManagementProps {
  restaurant: any;
}

const categories = ["Ingredients", "Beverages", "Packaging", "Cleaning", "Equipment", "Other"];

const LynInventoryManagement = ({ restaurant }: LynInventoryManagementProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Ingredients",
    current_stock: "",
    min_stock_level: "10",
    unit: "units",
    cost_per_unit: "",
    supplier_id: ""
  });
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, suppliersRes] = await Promise.all([
        supabase
          .from("lyn_inventory_items")
          .select("*, lyn_suppliers(name)")
          .eq("restaurant_id", restaurant.id)
          .order("name"),
        supabase
          .from("lyn_suppliers")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .eq("is_active", true)
          .order("name")
      ]);

      setItems(itemsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async () => {
    if (!newItem.name || !newItem.current_stock) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const itemData = {
        restaurant_id: restaurant.id,
        name: newItem.name,
        category: newItem.category,
        current_stock: parseInt(newItem.current_stock),
        min_stock_level: parseInt(newItem.min_stock_level),
        unit: newItem.unit,
        cost_per_unit: newItem.cost_per_unit ? parseFloat(newItem.cost_per_unit) : null,
        supplier_id: newItem.supplier_id || null
      };

      if (editingItem) {
        const { error } = await supabase
          .from("lyn_inventory_items")
          .update(itemData)
          .eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Item Updated" });
      } else {
        const { error } = await supabase
          .from("lyn_inventory_items")
          .insert(itemData);
        if (error) throw error;
        toast({ title: "Item Added" });
      }

      resetItemForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    
    try {
      const { error } = await supabase
        .from("lyn_inventory_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Item Deleted" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveSupplier = async () => {
    if (!newSupplier.name) {
      toast({
        title: "Missing Name",
        description: "Please enter a supplier name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("lyn_suppliers")
        .insert({
          restaurant_id: restaurant.id,
          ...newSupplier
        });

      if (error) throw error;
      toast({ title: "Supplier Added" });
      setNewSupplier({ name: "", contact_name: "", phone: "", email: "", address: "" });
      setSupplierDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetItemForm = () => {
    setNewItem({
      name: "",
      category: "Ingredients",
      current_stock: "",
      min_stock_level: "10",
      unit: "units",
      cost_per_unit: "",
      supplier_id: ""
    });
    setEditingItem(null);
    setItemDialogOpen(false);
  };

  const editItem = (item: any) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      current_stock: item.current_stock.toString(),
      min_stock_level: item.min_stock_level.toString(),
      unit: item.unit,
      cost_per_unit: item.cost_per_unit?.toString() || "",
      supplier_id: item.supplier_id || ""
    });
    setItemDialogOpen(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock_level);
  const totalValue = items.reduce((sum, i) => sum + (i.current_stock * (i.cost_per_unit || 0)), 0);

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
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Track stock levels and manage suppliers</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Supplier Name *</Label>
                  <Input
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={newSupplier.contact_name}
                    onChange={(e) => setNewSupplier({...newSupplier, contact_name: e.target.value})}
                    placeholder="Contact name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      placeholder="+212..."
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    placeholder="Full address"
                  />
                </div>
                <Button onClick={saveSupplier} className="w-full">
                  Add Supplier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={itemDialogOpen} onOpenChange={(open) => { if (!open) resetItemForm(); else setItemDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Item Name *</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g., Tomatoes"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(v) => setNewItem({...newItem, category: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select 
                      value={newItem.unit} 
                      onValueChange={(v) => setNewItem({...newItem, unit: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="units">Units</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="packs">Packs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Stock *</Label>
                    <Input
                      type="number"
                      value={newItem.current_stock}
                      onChange={(e) => setNewItem({...newItem, current_stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Min Stock Level</Label>
                    <Input
                      type="number"
                      value={newItem.min_stock_level}
                      onChange={(e) => setNewItem({...newItem, min_stock_level: e.target.value})}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cost per Unit (DH)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newItem.cost_per_unit}
                      onChange={(e) => setNewItem({...newItem, cost_per_unit: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Supplier</Label>
                    <Select 
                      value={newItem.supplier_id} 
                      onValueChange={(v) => setNewItem({...newItem, supplier_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={saveItem} className="w-full">
                  {editingItem ? "Update Item" : "Add Item"}
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
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 ${lowStockItems.length > 0 ? 'bg-red-500/20' : 'bg-green-500/20'} rounded-full flex items-center justify-center`}>
                <AlertTriangle className={`h-5 w-5 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className={`text-xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : ''}`}>{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suppliers</p>
                <p className="text-xl font-bold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{totalValue.toFixed(0)} DH</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Min Level</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={item.current_stock <= item.min_stock_level ? "text-red-600 font-medium" : ""}>
                        {item.current_stock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.min_stock_level}
                    </TableCell>
                    <TableCell>{item.lyn_suppliers?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      {item.cost_per_unit ? `${Number(item.cost_per_unit).toFixed(2)} DH` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => editItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LynInventoryManagement;
