import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Users,
  Store,
  Bike,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeRiders: 0,
    totalRestaurants: 0,
  });

  // Applications
  const [riderApplications, setRiderApplications] = useState<any[]>([]);
  const [restaurantApplications, setRestaurantApplications] = useState<any[]>([]);
  
  // Management data
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  // Dialog states
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    type: 'rider' | 'restaurant' | null;
    application: any;
    action: 'approve' | 'reject' | null;
  }>({
    open: false,
    type: null,
    application: null,
    action: null,
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in');
      navigate('/auth');
      return;
    }

    setUser(user);

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roles?.some(r => r.role === 'admin');
    
    if (!hasAdminRole) {
      toast.error('Access denied: Admin privileges required');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchApplications(),
        fetchOrders(),
        fetchRiders(),
        fetchRestaurants(),
        fetchSupportTickets(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const [ordersRes, usersRes, ridersRes, restaurantsRes] = await Promise.all([
      supabase.from('orders').select('total_amount, status', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('rider_profiles').select('is_available').eq('status', 'approved'),
      supabase.from('restaurants').select('id', { count: 'exact' }),
    ]);

    const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const activeOrders = ordersRes.data?.filter(o => 
      ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(o.status)
    ).length || 0;
    const activeRiders = ridersRes.data?.filter(r => r.is_available).length || 0;

    setStats({
      totalOrders: ordersRes.count || 0,
      activeOrders,
      totalRevenue,
      totalUsers: usersRes.count || 0,
      activeRiders,
      totalRestaurants: restaurantsRes.count || 0,
    });
  };

  const fetchApplications = async () => {
    const [riderApps, restaurantApps] = await Promise.all([
      supabase
        .from('rider_profiles')
        .select('*, profiles!rider_profiles_rider_id_fkey(full_name, phone)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('restaurant_applications')
        .select('*, profiles!restaurant_applications_merchant_id_fkey(full_name, phone)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    setRiderApplications(riderApps.data || []);
    setRestaurantApplications(restaurantApps.data || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!orders_customer_id_fkey(full_name),
        restaurants(name),
        rider_profiles!orders_rider_id_fkey(profiles!rider_profiles_rider_id_fkey(full_name))
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    setOrders(data || []);
  };

  const fetchRiders = async () => {
    const { data } = await supabase
      .from('rider_profiles')
      .select('*, profiles!rider_profiles_rider_id_fkey(full_name, phone)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    setRiders(data || []);
  };

  const fetchRestaurants = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('*, profiles!restaurants_merchant_id_fkey(full_name, phone)')
      .order('created_at', { ascending: false });

    setRestaurants(data || []);
  };

  const fetchSupportTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, profiles!support_tickets_user_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    setSupportTickets(data || []);
  };

  const handleReviewApplication = (type: 'rider' | 'restaurant', application: any, action: 'approve' | 'reject') => {
    setReviewDialog({
      open: true,
      type,
      application,
      action,
    });
    setRejectionReason('');
  };

  const confirmReview = async () => {
    const { type, application, action } = reviewDialog;
    
    try {
      if (type === 'rider') {
        if (action === 'approve') {
          const { error } = await supabase.rpc('approve_rider_application', {
            rider_profile_id: application.id,
            admin_id: user!.id,
          });
          if (error) throw error;
          toast.success('Rider application approved');
        } else {
          const { error } = await supabase.rpc('reject_rider_application', {
            rider_profile_id: application.id,
            admin_id: user!.id,
            reason: rejectionReason,
          });
          if (error) throw error;
          toast.success('Rider application rejected');
        }
      } else if (type === 'restaurant') {
        if (action === 'approve') {
          const { error } = await supabase.rpc('approve_restaurant_application', {
            application_id: application.id,
            admin_id: user!.id,
          });
          if (error) throw error;
          toast.success('Restaurant application approved');
        } else {
          const { error } = await supabase.rpc('reject_restaurant_application', {
            application_id: application.id,
            admin_id: user!.id,
            reason: rejectionReason,
          });
          if (error) throw error;
          toast.success('Restaurant application rejected');
        }
      }

      setReviewDialog({ open: false, type: null, application: null, action: null });
      fetchApplications();
      fetchStats();
    } catch (error: any) {
      console.error('Error reviewing application:', error);
      toast.error(error.message || 'Failed to process application');
    }
  };

  const toggleRestaurantStatus = async (restaurantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !currentStatus })
        .eq('id', restaurantId);

      if (error) throw error;
      toast.success(`Restaurant ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchRestaurants();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update restaurant status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage ATLAAS GO platform</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">{stats.activeOrders} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} MAD</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRiders}</div>
              <p className="text-xs text-muted-foreground">Online now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {riderApplications.length + restaurantApplications.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {riderApplications.length} riders, {restaurantApplications.length} restaurants
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="riders">Riders</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rider Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {riderApplications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending applications</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riderApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{app.profiles?.full_name || 'N/A'}</TableCell>
                          <TableCell>{app.phone}</TableCell>
                          <TableCell>{app.city}</TableCell>
                          <TableCell>{app.vehicle_type}</TableCell>
                          <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReviewApplication('rider', app, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReviewApplication('rider', app, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restaurant Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {restaurantApplications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending applications</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Restaurant Name</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Cuisine</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {restaurantApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.restaurant_name}</TableCell>
                          <TableCell>{app.profiles?.full_name || 'N/A'}</TableCell>
                          <TableCell>{app.cuisine_type}</TableCell>
                          <TableCell className="max-w-xs truncate">{app.address}</TableCell>
                          <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReviewApplication('restaurant', app, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReviewApplication('restaurant', app, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{order.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell>{order.restaurants?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {order.rider_profiles?.profiles?.full_name || 'Unassigned'}
                        </TableCell>
                        <TableCell>{order.total_amount} MAD</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Riders Tab */}
          <TabsContent value="riders">
            <Card>
              <CardHeader>
                <CardTitle>Active Riders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Deliveries</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riders.map((rider) => (
                      <TableRow key={rider.id}>
                        <TableCell>{rider.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell>{rider.phone}</TableCell>
                        <TableCell>{rider.city}</TableCell>
                        <TableCell>{rider.vehicle_type}</TableCell>
                        <TableCell>{rider.total_deliveries}</TableCell>
                        <TableCell>{rider.rating?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={rider.is_available ? 'default' : 'secondary'}>
                            {rider.is_available ? 'Online' : 'Offline'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <Card>
              <CardHeader>
                <CardTitle>Restaurants</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Cuisine</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">{restaurant.name}</TableCell>
                        <TableCell>{restaurant.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell>{restaurant.cuisine_type}</TableCell>
                        <TableCell>
                          {restaurant.average_rating?.toFixed(1) || 'N/A'}
                        </TableCell>
                        <TableCell>{restaurant.review_count}</TableCell>
                        <TableCell>
                          <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                            {restaurant.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.is_active)}
                          >
                            {restaurant.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-sm">
                          {ticket.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{ticket.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.priority === 'high' ? 'destructive' :
                            ticket.priority === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => 
        setReviewDialog({ ...reviewDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.action === 'approve' 
                ? 'Are you sure you want to approve this application?'
                : 'Please provide a reason for rejection:'}
            </DialogDescription>
          </DialogHeader>
          
          {reviewDialog.action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog({ open: false, type: null, application: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              disabled={reviewDialog.action === 'reject' && !rejectionReason.trim()}
              variant={reviewDialog.action === 'approve' ? 'default' : 'destructive'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
