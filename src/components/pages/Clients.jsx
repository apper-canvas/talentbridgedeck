import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { clientService } from "@/services/api/clientService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import ClientModal from "@/components/organisms/ClientModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";

function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    setLoading(true)
    setError(null)
    
    try {
      const clientsData = await clientService.getAll()
      setClients(clientsData)
    } catch (err) {
      setError('Failed to load clients. Please try again.')
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleCreateClient() {
    setEditingClient(null)
    setIsModalOpen(true)
  }

  function handleEditClient(client) {
    setEditingClient(client)
    setIsModalOpen(true)
  }

async function handleSaveClient(clientData) {
    try {
      const mappedData = {
        Name: clientData.companyName,
        companyName_c: clientData.companyName,
        contactPerson_c: clientData.contactPerson,
        email_c: clientData.email,
        phone_c: clientData.phone,
        address_c: clientData.address,
        relationshipStatus_c: clientData.relationshipStatus || "prospect"
      };

      if (editingClient) {
        const updatedClient = await clientService.update(editingClient.Id, mappedData)
        setClients(prev => prev.map(client => 
          client.Id === editingClient.Id ? updatedClient : client
        ))
        toast.success('Client updated successfully!')
      } else {
        const newClient = await clientService.create(mappedData)
        setClients(prev => [newClient, ...prev])
        toast.success('Client created successfully!')
      }
      setIsModalOpen(false)
      setEditingClient(null)
    } catch (error) {
      throw error
    }
  }

async function handleDeleteClient(client) {
    const companyName = client.companyName_c || client.companyName || 'this client';
    if (window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      try {
        await clientService.delete(client.Id)
        setClients(prev => prev.filter(c => c.Id !== client.Id))
        toast.success('Client deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete client. Please try again.')
        console.error('Error deleting client:', error)
      }
    }
  }

const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase()
    const companyName = client.companyName_c || client.companyName || '';
    const contactPerson = client.contactPerson_c || client.contactPerson || '';
    const email = client.email_c || client.email || '';
    const relationshipStatus = client.relationshipStatus_c || client.relationshipStatus || '';
    
    const matchesSearch = companyName.toLowerCase().includes(searchLower) ||
                         contactPerson.toLowerCase().includes(searchLower) ||
                         email.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || relationshipStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "active";
      case "prospect":
        return "pending";
      case "inactive":
        return "inactive";
      default:
        return "default";
    }
  };

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadClients} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client companies and relationships</p>
        </div>
        
        <Button 
          onClick={handleCreateClient}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search clients, contacts, or email..."
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="Building2" size={20} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ApperIcon name="CheckCircle" size={20} className="text-green-600" />
              </div>
              <div className="ml-3">
<p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => (c.relationshipStatus_c || c.relationshipStatus) === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ApperIcon name="Clock" size={20} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Prospects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => (c.relationshipStatus_c || c.relationshipStatus) === 'prospect').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ApperIcon name="XCircle" size={20} className="text-gray-600" />
              </div>
              <div className="ml-3">
<p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => (c.relationshipStatus_c || c.relationshipStatus) === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Empty 
          title="No clients found"
          description={searchTerm || statusFilter !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Get started by adding your first client company"
          }
          action={
            <Button onClick={handleCreateClient} className="flex items-center gap-2">
              <ApperIcon name="Plus" size={16} />
              Add Client
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.Id} className="hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
<div className="flex-1">
                    <h3 className="text-lg font-semibold font-display text-gray-900 mb-1">
                      {client.companyName_c || client.companyName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <ApperIcon name="User" size={14} className="mr-1" />
                      {client.contactPerson_c || client.contactPerson}
                    </div>
                    <Badge variant={getStatusVariant(client.relationshipStatus_c || client.relationshipStatus)}>
                      {client.relationshipStatus_c || client.relationshipStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
                
<div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ApperIcon name="Mail" size={14} className="mr-2 text-gray-400" />
                    <span className="truncate">{client.email_c || client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <ApperIcon name="Phone" size={14} className="mr-2 text-gray-400" />
                    <span>{client.phone_c || client.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <ApperIcon name="MapPin" size={14} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-2">{client.address_c || client.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </div>
  )
}

export default Clients