import React, { useEffect, useState } from "react";
import ApplyCandidateModal from "@/components/organisms/ApplyCandidateModal";
import { applicationService } from "@/services/api/applicationService";
import { toast } from "react-toastify";
import { jobService } from "@/services/api/jobService";
import { candidateService } from "@/services/api/candidateService";
import { clientService } from "@/services/api/clientService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import JobCard from "@/components/molecules/JobCard";
import JobModal from "@/components/organisms/JobModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
function Jobs() {
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
const [applications, setApplications] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  
  useEffect(() => {
    loadJobs()
  }, [])

async function loadJobs() {
    setLoading(true)
    setError(null)
    
    try {
      const [jobsData, candidatesData, applicationsData, clientsData] = await Promise.all([
        jobService.getAll(),
        candidateService.getAll(),
        applicationService.getAll(),
        clientService.getAll()
      ])
      
      setJobs(jobsData)
      setCandidates(candidatesData)
      setApplications(applicationsData)
      setClients(clientsData)
    } catch (err) {
      setError('Failed to load jobs. Please try again.')
      console.error('Error loading jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleCreateJob() {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  function handleEditJob(job) {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  function handleApplyCandidate(job) {
    setSelectedJob(job)
    setIsApplyModalOpen(true)
  }

function handleApplicationCreated(newApplication) {
    setApplications(prev => [...prev, newApplication])
    
    // Update job applicants count
    setJobs(prev => prev.map(job => 
      job.Id === (newApplication.jobId_c || newApplication.jobId)
        ? { ...job, applicants_c: ((job.applicants_c || job.applicants) || 0) + 1 }
        : job
    ))
  }
async function handleSaveJob(jobData) {
    try {
      const client = clients.find(c => c.Id === parseInt(jobData.clientId))
      const mappedJobData = {
        Name: jobData.title,
        title_c: jobData.title,
        company_c: client ? (client.companyName_c || client.companyName) : jobData.company,
        location_c: jobData.location,
        jobType_c: jobData.jobType || "Full-time",
        salaryMin_c: jobData.salaryMin ? parseInt(jobData.salaryMin) : null,
        salaryMax_c: jobData.salaryMax ? parseInt(jobData.salaryMax) : null,
        requiredSkills_c: jobData.requiredSkills,
        experienceLevel_c: jobData.experienceLevel || "Mid-level",
        description_c: jobData.description,
        status_c: jobData.status || "active",
        clientId_c: jobData.clientId ? parseInt(jobData.clientId) : null
      }
      
      if (editingJob) {
        const updatedJob = await jobService.update(editingJob.Id, mappedJobData)
        setJobs(prev => prev.map(job => 
          job.Id === editingJob.Id ? updatedJob : job
        ))
        toast.success('Job updated successfully!')
      } else {
        const newJob = await jobService.create(mappedJobData)
        setJobs(prev => [newJob, ...prev])
        toast.success('Job created successfully!')
      }
      setIsModalOpen(false)
      setEditingJob(null)
    } catch (error) {
      throw error
    }
  }

  async function handleDeleteJob(job) {
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return
    }

    try {
      await jobService.delete(job.Id)
      setJobs(prev => prev.filter(j => j.Id !== job.Id))
      toast.success('Job deleted successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to delete job')
}
  }

const getAppliedCandidatesForJob = (jobId) => {
    const jobApplications = applications.filter(app => (app.jobId_c || app.jobId) === jobId)
    return jobApplications.map(app => 
      candidates.find(candidate => candidate.Id === (app.candidateId_c || app.candidateId))
    ).filter(Boolean)
  }

const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase()
    const jobTitle = job.title_c || job.title || '';
    const jobCompany = job.company_c || job.company || '';
    const jobDescription = job.description_c || job.description || '';
    const client = clients.find(c => (c.companyName_c || c.companyName) === jobCompany)
    return jobTitle.toLowerCase().includes(searchLower) ||
           jobCompany.toLowerCase().includes(searchLower) ||
           jobDescription.toLowerCase().includes(searchLower) ||
           (client?.contactPerson_c || client?.contactPerson || '').toLowerCase().includes(searchLower)
  })
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Job Openings
          </h1>
          <p className="text-gray-600">
            Manage your job postings and track applications
          </p>
        </div>
        <Button onClick={handleCreateJob} className="shrink-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Job
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search jobs..."
        />
      </div>

{/* Jobs Grid */}
      {loading ? (
        <Loading />
      ) : error ? (
        <Error message={error} onRetry={loadJobs} />
      ) : filteredJobs.length === 0 ? (
        <Empty
          title="No jobs found"
          description={searchTerm ? "Try adjusting your search terms." : "Create your first job posting to get started."}
          icon="Briefcase"
          actionLabel={!searchTerm ? "Add Job" : undefined}
          onAction={!searchTerm ? handleCreateJob : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.Id}
              job={job}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onApplyCandidate={handleApplyCandidate}
              appliedCandidates={getAppliedCandidatesForJob(job.Id)}
            />
          ))}
</div>
      )}

<JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveJob}
        job={editingJob}
        clients={clients}
      />

      <ApplyCandidateModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={selectedJob}
        onApplicationCreated={handleApplicationCreated}
      />
    </div>
  );
};

export default Jobs;