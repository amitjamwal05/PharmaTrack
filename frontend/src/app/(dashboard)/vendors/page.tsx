'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Truck, Plus, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: ''
  });

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch (error) {
      console.error('Error fetching vendors', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenModal = (vendor?: any) => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        contactPerson: vendor.contactPerson || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        gstNumber: vendor.gstNumber || ''
      });
      setEditingId(vendor._id);
    } else {
      setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '' });
      setEditingId('');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/vendors/${editingId}`, formData);
        toast.success('Vendor updated successfully');
      } else {
        await api.post('/vendors', formData);
        toast.success('Vendor added successfully');
      }
      setModalOpen(false);
      fetchVendors();
    } catch (error) {
      toast.error('Failed to save vendor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      toast.success('Vendor deleted');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to delete vendor');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Truck className="mr-3 w-8 h-8 text-teal-600" />
            Vendor Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage suppliers, distributors, and pharmaceutical companies.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card text-card-foreground border border-border w-full max-w-lg p-6 rounded-xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Person</label>
                  <Input 
                    value={formData.contactPerson} 
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input 
                    type="tel"
                    required 
                    value={formData.phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) {
                        setFormData({...formData, phone: val});
                      }
                    }}
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">GST Number</label>
                  <Input 
                    placeholder="e.g., 29ABCDE1234F1Z5"
                    value={formData.gstNumber} 
                    onChange={e => {
                      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      if (val.length <= 15) {
                        setFormData({...formData, gstNumber: val});
                      }
                    }}
                    maxLength={15}
                    pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                    title="Please enter a valid 15-character GSTIN (e.g., 29ABCDE1234F1Z5)"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Full Address</label>
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save Vendor</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>Directory of all registered product suppliers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone / Email</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6">Loading vendors...</TableCell></TableRow>
                ) : vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <PackageSearch className="h-12 w-12 mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-foreground">No vendors yet</h3>
                        <p className="text-sm mt-1">Click the "Add Vendor" button to add your first supplier.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map(vendor => (
                    <TableRow key={vendor._id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors border-l-2 border-transparent hover:border-teal-500">
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.contactPerson || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{vendor.phone}</div>
                        <div className="text-xs text-muted-foreground">{vendor.email}</div>
                      </TableCell>
                      <TableCell>{vendor.gstNumber || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(vendor)}>
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vendor._id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
