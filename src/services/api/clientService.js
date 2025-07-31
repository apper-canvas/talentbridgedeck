const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const clientService = {
  async getAll() {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "companyName_c" } },
        { field: { Name: "contactPerson_c" } },
        { field: { Name: "email_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "address_c" } },
        { field: { Name: "relationshipStatus_c" } },
        { field: { Name: "createdAt_c" } }
      ]
    };

    const response = await apperClient.fetchRecords("client_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data || [];
  },

  async getById(id) {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "companyName_c" } },
        { field: { Name: "contactPerson_c" } },
        { field: { Name: "email_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "address_c" } },
        { field: { Name: "relationshipStatus_c" } },
        { field: { Name: "createdAt_c" } }
      ]
    };

    const response = await apperClient.getRecordById("client_c", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data;
  },

  async create(clientData) {
    const params = {
      records: [
        {
          Name: clientData.Name || clientData.companyName,
          companyName_c: clientData.companyName_c || clientData.companyName,
          contactPerson_c: clientData.contactPerson_c || clientData.contactPerson,
          email_c: clientData.email_c || clientData.email,
          phone_c: clientData.phone_c || clientData.phone,
          address_c: clientData.address_c || clientData.address,
          relationshipStatus_c: clientData.relationshipStatus_c || clientData.relationshipStatus || "prospect",
          createdAt_c: clientData.createdAt_c || clientData.createdAt || new Date().toISOString()
        }
      ]
    };

    const response = await apperClient.createRecord("client_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create client ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulRecords.length > 0 ? successfulRecords[0].data : null;
    }

    throw new Error('No results returned from create operation');
  },

  async update(id, clientData) {
    const updateFields = {
      Id: parseInt(id)
    };

    // Only include updateable fields
    if (clientData.Name !== undefined) updateFields.Name = clientData.Name;
    if (clientData.companyName_c !== undefined) updateFields.companyName_c = clientData.companyName_c;
    if (clientData.contactPerson_c !== undefined) updateFields.contactPerson_c = clientData.contactPerson_c;
    if (clientData.email_c !== undefined) updateFields.email_c = clientData.email_c;
    if (clientData.phone_c !== undefined) updateFields.phone_c = clientData.phone_c;
    if (clientData.address_c !== undefined) updateFields.address_c = clientData.address_c;
    if (clientData.relationshipStatus_c !== undefined) updateFields.relationshipStatus_c = clientData.relationshipStatus_c;

    const params = {
      records: [updateFields]
    };

    const response = await apperClient.updateRecord("client_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update client ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
    }

    throw new Error('No results returned from update operation');
  },

  async delete(id) {
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await apperClient.deleteRecord("client_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete client ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulDeletions.length > 0;
    }

return false;
  }
};