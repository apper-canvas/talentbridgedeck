const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const noteService = {
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
        { field: { Name: "entityType_c" } },
        { field: { Name: "entityId_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "content_c" } },
        { field: { Name: "createdAt_c" } },
        { field: { Name: "updatedAt_c" } }
      ],
      orderBy: [
        {
          fieldName: "createdAt_c",
          sorttype: "DESC"
        }
      ]
    };

    const response = await apperClient.fetchRecords("note_c", params);
    
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
        { field: { Name: "entityType_c" } },
        { field: { Name: "entityId_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "content_c" } },
        { field: { Name: "createdAt_c" } },
        { field: { Name: "updatedAt_c" } }
      ]
    };

    const response = await apperClient.getRecordById("note_c", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data;
  },

  async getByEntity(entityType, entityId) {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "entityType_c" } },
        { field: { Name: "entityId_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "content_c" } },
        { field: { Name: "createdAt_c" } },
        { field: { Name: "updatedAt_c" } },
        { field: { Name: "CreatedBy" } }
      ],
      where: [
        {
          FieldName: "entityType_c",
          Operator: "EqualTo",
          Values: [entityType],
          Include: true
        },
        {
          FieldName: "entityId_c",
          Operator: "EqualTo",
          Values: [parseInt(entityId)],
          Include: true
        }
      ],
      orderBy: [
        {
          fieldName: "createdAt_c",
          sorttype: "DESC"
        }
      ]
    };

    const response = await apperClient.fetchRecords("note_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data || [];
  },

  async create(noteData) {
    const params = {
      records: [
        {
          Name: `${noteData.category} - ${Date.now()}`,
          entityType_c: noteData.entityType_c || noteData.entityType,
          entityId_c: parseInt(noteData.entityId_c || noteData.entityId),
          category_c: noteData.category_c || noteData.category,
          content_c: noteData.content_c || noteData.content,
          createdAt_c: noteData.createdAt_c || noteData.createdAt || new Date().toISOString(),
          updatedAt_c: noteData.updatedAt_c || noteData.updatedAt || new Date().toISOString()
        }
      ]
    };

    const response = await apperClient.createRecord("note_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create note ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
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

  async update(id, updateData) {
    const updateFields = {
      Id: parseInt(id)
    };

    // Only include updateable fields
    if (updateData.category_c !== undefined) updateFields.category_c = updateData.category_c;
    if (updateData.content_c !== undefined) updateFields.content_c = updateData.content_c;
    if (updateData.updatedAt_c !== undefined) updateFields.updatedAt_c = updateData.updatedAt_c;
    else updateFields.updatedAt_c = new Date().toISOString();

    const params = {
      records: [updateFields]
    };

    const response = await apperClient.updateRecord("note_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update note ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
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

    const response = await apperClient.deleteRecord("note_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete note ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulDeletions.length > 0;
    }

    return false;
  },

  canEdit(note) {
    const noteTime = new Date(note.createdAt_c || note.CreatedOn);
    const now = new Date();
    const hoursDiff = (now - noteTime) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }
};