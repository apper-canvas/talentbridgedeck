const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const jobService = {
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
        { field: { Name: "title_c" } },
        { field: { Name: "company_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "jobType_c" } },
        { field: { Name: "salaryMin_c" } },
        { field: { Name: "salaryMax_c" } },
        { field: { Name: "requiredSkills_c" } },
        { field: { Name: "experienceLevel_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "createdAt_c" } },
        { field: { Name: "applicants_c" } },
        { field: { Name: "clientId_c" } }
      ]
    };

    const response = await apperClient.fetchRecords("job_c", params);
    
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
        { field: { Name: "title_c" } },
        { field: { Name: "company_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "jobType_c" } },
        { field: { Name: "salaryMin_c" } },
        { field: { Name: "salaryMax_c" } },
        { field: { Name: "requiredSkills_c" } },
        { field: { Name: "experienceLevel_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "createdAt_c" } },
        { field: { Name: "applicants_c" } },
        { field: { Name: "clientId_c" } }
      ]
    };

    const response = await apperClient.getRecordById("job_c", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data;
  },

  async create(jobData) {
    const params = {
      records: [
        {
          Name: jobData.Name || jobData.title,
          title_c: jobData.title_c || jobData.title,
          company_c: jobData.company_c || jobData.company,
          location_c: jobData.location_c || jobData.location,
          jobType_c: jobData.jobType_c || jobData.jobType || "Full-time",
          salaryMin_c: jobData.salaryMin_c || jobData.salaryMin ? parseInt(jobData.salaryMin_c || jobData.salaryMin) : null,
          salaryMax_c: jobData.salaryMax_c || jobData.salaryMax ? parseInt(jobData.salaryMax_c || jobData.salaryMax) : null,
          requiredSkills_c: jobData.requiredSkills_c || jobData.requiredSkills,
          experienceLevel_c: jobData.experienceLevel_c || jobData.experienceLevel || "Mid-level",
          description_c: jobData.description_c || jobData.description,
          status_c: jobData.status_c || jobData.status || "active",
          createdAt_c: jobData.createdAt_c || jobData.createdAt || new Date().toISOString(),
          applicants_c: jobData.applicants_c || jobData.applicants || 0,
          clientId_c: jobData.clientId_c || jobData.clientId ? parseInt(jobData.clientId_c || jobData.clientId) : null
        }
      ]
    };

    const response = await apperClient.createRecord("job_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create job ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
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
    if (updateData.Name !== undefined) updateFields.Name = updateData.Name;
    if (updateData.title_c !== undefined) updateFields.title_c = updateData.title_c;
    if (updateData.company_c !== undefined) updateFields.company_c = updateData.company_c;
    if (updateData.location_c !== undefined) updateFields.location_c = updateData.location_c;
    if (updateData.jobType_c !== undefined) updateFields.jobType_c = updateData.jobType_c;
    if (updateData.salaryMin_c !== undefined) updateFields.salaryMin_c = updateData.salaryMin_c ? parseInt(updateData.salaryMin_c) : null;
    if (updateData.salaryMax_c !== undefined) updateFields.salaryMax_c = updateData.salaryMax_c ? parseInt(updateData.salaryMax_c) : null;
    if (updateData.requiredSkills_c !== undefined) updateFields.requiredSkills_c = updateData.requiredSkills_c;
    if (updateData.experienceLevel_c !== undefined) updateFields.experienceLevel_c = updateData.experienceLevel_c;
    if (updateData.description_c !== undefined) updateFields.description_c = updateData.description_c;
    if (updateData.status_c !== undefined) updateFields.status_c = updateData.status_c;
    if (updateData.applicants_c !== undefined) updateFields.applicants_c = updateData.applicants_c;
    if (updateData.clientId_c !== undefined) updateFields.clientId_c = updateData.clientId_c ? parseInt(updateData.clientId_c) : null;

    const params = {
      records: [updateFields]
    };

    const response = await apperClient.updateRecord("job_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update job ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
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

    const response = await apperClient.deleteRecord("job_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete job ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulDeletions.length > 0;
    }

    return false;
  }
};