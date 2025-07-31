const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const applicationService = {
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
        { field: { Name: "jobId_c" } },
        { field: { Name: "candidateId_c" } },
        { field: { Name: "appliedAt_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "interview_date_c" } },
        { field: { Name: "interview_time_c" } },
        { field: { Name: "interview_interviewer_c" } },
        { field: { Name: "interview_type_c" } },
        { field: { Name: "interview_notes_c" } }
      ]
    };

    const response = await apperClient.fetchRecords("application_c", params);
    
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
        { field: { Name: "jobId_c" } },
        { field: { Name: "candidateId_c" } },
        { field: { Name: "appliedAt_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "interview_date_c" } },
        { field: { Name: "interview_time_c" } },
        { field: { Name: "interview_interviewer_c" } },
        { field: { Name: "interview_type_c" } },
        { field: { Name: "interview_notes_c" } }
      ]
    };

    const response = await apperClient.getRecordById("application_c", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data;
  },

  async getByJobId(jobId) {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "jobId_c" } },
        { field: { Name: "candidateId_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "appliedAt_c" } }
      ],
      where: [
        {
          FieldName: "jobId_c",
          Operator: "EqualTo",
          Values: [parseInt(jobId)],
          Include: true
        }
      ]
    };

    const response = await apperClient.fetchRecords("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data || [];
  },

  async getByCandidateId(candidateId) {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "jobId_c" } },
        { field: { Name: "candidateId_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "appliedAt_c" } }
      ],
      where: [
        {
          FieldName: "candidateId_c",
          Operator: "EqualTo",
          Values: [parseInt(candidateId)],
          Include: true
        }
      ]
    };

    const response = await apperClient.fetchRecords("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data || [];
  },

  async create(applicationData) {
    const params = {
      records: [
        {
          Name: applicationData.Name || `Application - ${Date.now()}`,
          jobId_c: parseInt(applicationData.jobId_c || applicationData.jobId),
          candidateId_c: parseInt(applicationData.candidateId_c || applicationData.candidateId),
          appliedAt_c: applicationData.appliedAt_c || new Date().toISOString(),
          status_c: applicationData.status_c || 'applied',
          notes_c: applicationData.notes_c || applicationData.notes || ''
        }
      ]
    };

    const response = await apperClient.createRecord("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create application ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
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

  async updateStatus(applicationId, newStatus) {
    const params = {
      records: [
        {
          Id: parseInt(applicationId),
          status_c: newStatus
        }
      ]
    };

    const response = await apperClient.updateRecord("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update application ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
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

  async update(id, applicationData) {
    const updateData = {
      Id: parseInt(id)
    };

    // Only include updateable fields
    if (applicationData.status_c !== undefined) updateData.status_c = applicationData.status_c;
    if (applicationData.notes_c !== undefined) updateData.notes_c = applicationData.notes_c;
    if (applicationData.interview_date_c !== undefined) updateData.interview_date_c = applicationData.interview_date_c;
    if (applicationData.interview_time_c !== undefined) updateData.interview_time_c = applicationData.interview_time_c;
    if (applicationData.interview_interviewer_c !== undefined) updateData.interview_interviewer_c = applicationData.interview_interviewer_c;
    if (applicationData.interview_type_c !== undefined) updateData.interview_type_c = applicationData.interview_type_c;
    if (applicationData.interview_notes_c !== undefined) updateData.interview_notes_c = applicationData.interview_notes_c;

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update application ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
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

    const response = await apperClient.deleteRecord("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete application ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulDeletions.length > 0;
    }

    return false;
  },

  async checkApplication(jobId, candidateId) {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "jobId_c" } },
        { field: { Name: "candidateId_c" } }
      ],
      where: [
        {
          FieldName: "jobId_c",
          Operator: "EqualTo",
          Values: [parseInt(jobId)],
          Include: true
        },
        {
          FieldName: "candidateId_c",
          Operator: "EqualTo",
          Values: [parseInt(candidateId)],
          Include: true
        }
      ]
    };

    const response = await apperClient.fetchRecords("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data && response.data.length > 0 ? response.data[0] : null;
  },

  async scheduleInterview(applicationId, interviewData) {
    const updateData = {
      Id: parseInt(applicationId),
      status_c: 'interview_scheduled',
      interview_date_c: interviewData.date,
      interview_time_c: interviewData.time,
      interview_interviewer_c: interviewData.interviewer,
      interview_type_c: interviewData.type,
      interview_notes_c: interviewData.notes || ''
    };

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to schedule interview ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
    }

    throw new Error('No results returned from schedule interview operation');
  },

  async updateInterview(applicationId, interviewData) {
    const updateData = {
      Id: parseInt(applicationId)
    };

    if (interviewData.date !== undefined) updateData.interview_date_c = interviewData.date;
    if (interviewData.time !== undefined) updateData.interview_time_c = interviewData.time;
    if (interviewData.interviewer !== undefined) updateData.interview_interviewer_c = interviewData.interviewer;
    if (interviewData.type !== undefined) updateData.interview_type_c = interviewData.type;
    if (interviewData.notes !== undefined) updateData.interview_notes_c = interviewData.notes;

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update interview ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
    }

    throw new Error('No results returned from update interview operation');
  },

  async getUpcomingInterviews() {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "jobId_c" } },
        { field: { Name: "candidateId_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "interview_date_c" } },
        { field: { Name: "interview_time_c" } },
        { field: { Name: "interview_interviewer_c" } },
        { field: { Name: "interview_type_c" } },
        { field: { Name: "interview_notes_c" } }
      ],
      where: [
        {
          FieldName: "status_c",
          Operator: "EqualTo",
          Values: ["interview_scheduled"],
          Include: true
        },
        {
          FieldName: "interview_date_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [new Date().toISOString().split('T')[0]],
          Include: true
        }
      ],
      orderBy: [
        {
          fieldName: "interview_date_c",
          sorttype: "ASC"
        }
      ]
    };

    const response = await apperClient.fetchRecords("application_c", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    return response.data || [];
  }
};