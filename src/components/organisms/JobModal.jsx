import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Textarea from "@/components/atoms/Textarea";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import NotesList from "@/components/molecules/NotesList";
const JobModal = ({ isOpen, onClose, onSave, job = null, clients = [] }) => {
const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    company: "",
    location: "",
    jobType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    requiredSkills: "",
    experienceLevel: "Mid-level",
    description: "",
    status: "active"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
    if (job) {
      const jobCompany = job.company_c || job.company || '';
      const client = clients.find(c => (c.companyName_c || c.companyName) === jobCompany)
      setFormData({
        title: job.title_c || job.title || "",
        clientId: job.clientId_c || (client ? client.Id.toString() : ""),
        company: jobCompany,
        location: job.location_c || job.location || "",
        jobType: job.jobType_c || job.jobType || "Full-time",
        salaryMin: job.salaryMin_c || job.salaryMin || "",
        salaryMax: job.salaryMax_c || job.salaryMax || "",
        requiredSkills: job.requiredSkills_c || job.requiredSkills || "",
        experienceLevel: job.experienceLevel_c || job.experienceLevel || "Mid-level",
        description: job.description_c || job.description || "",
        status: job.status_c || job.status || "active"
      });
    } else {
      setFormData({
        title: "",
        clientId: "",
        company: "",
        location: "",
        jobType: "Full-time",
        salaryMin: "",
        salaryMax: "",
        requiredSkills: "",
        experienceLevel: "Mid-level",
        description: "",
        status: "active"
      });
    }
    setErrors({});
  }, [job, isOpen, clients]);

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }
    
    if (!formData.clientId && !formData.company.trim()) {
      newErrors.clientId = "Please select a client or enter company name";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!formData.requiredSkills.trim()) {
      newErrors.requiredSkills = "Required skills are required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }
    
    // Validate salary range if provided
    if (formData.salaryMin && formData.salaryMax) {
      const min = parseFloat(formData.salaryMin);
      const max = parseFloat(formData.salaryMax);
      if (min >= max) {
        newErrors.salaryMax = "Maximum salary must be greater than minimum";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast.success(job ? "Job updated successfully!" : "Job created successfully!");
      onClose();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold font-display text-gray-900">
                  {job ? "Edit Job" : "Create New Job"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

<form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Job Title"
                    required
                    error={errors.title}
                  >
                    <Input
                      placeholder="e.g. Senior Software Engineer"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      error={errors.title}
                    />
                  </FormField>

<FormField
                    label="Client Company"
                    required
                    error={errors.clientId}
                  >
                    <select
                      value={formData.clientId}
                      onChange={(e) => {
                        handleInputChange("clientId", e.target.value)
                        const selectedClient = clients.find(c => c.Id.toString() === e.target.value)
                        if (selectedClient) {
                          handleInputChange("company", selectedClient.companyName)
                        }
                      }}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a client...</option>
{clients.filter(c => (c.relationshipStatus_c || c.relationshipStatus) === 'active').map((client) => (
                        <option key={client.Id} value={client.Id}>
                          {client.companyName_c || client.companyName}
                        </option>
                      ))}
                    </select>
{formData.clientId && (
                      <div className="mt-2 text-xs text-gray-600">
                        Contact: {clients.find(c => c.Id.toString() === formData.clientId)?.contactPerson_c || clients.find(c => c.Id.toString() === formData.clientId)?.contactPerson}
                      </div>
                    )}
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Location"
                    required
                    error={errors.location}
                  >
                    <Input
                      placeholder="e.g. San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      error={errors.location}
                    />
                  </FormField>

                  <FormField
                    label="Job Type"
                  >
                    <select
                      value={formData.jobType}
                      onChange={(e) => handleInputChange("jobType", e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Minimum Salary ($)"
                  >
                    <Input
                      type="number"
                      placeholder="e.g. 80000"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label="Maximum Salary ($)"
                    error={errors.salaryMax}
                  >
                    <Input
                      type="number"
                      placeholder="e.g. 120000"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                      error={errors.salaryMax}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Required Skills"
                    required
                    error={errors.requiredSkills}
                  >
                    <Input
                      placeholder="e.g. React, Node.js, TypeScript"
                      value={formData.requiredSkills}
                      onChange={(e) => handleInputChange("requiredSkills", e.target.value)}
                      error={errors.requiredSkills}
                    />
                  </FormField>

                  <FormField
                    label="Experience Level"
                  >
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => handleInputChange("experienceLevel", e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior-level">Senior-level</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Status"
                  >
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="closed">Closed</option>
                    </select>
                  </FormField>
                </div>

                <FormField
                  label="Job Description"
                  required
                  error={errors.description}
                >
                  <Textarea
                    placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    error={errors.description}
                    rows={5}
                  />
</FormField>

                {/* Job Notes Section - Only show for existing jobs */}
                {job && (
                  <div className="border-t border-gray-200 pt-6">
                    <NotesList
                      entityType="job"
                      entityId={job.Id}
                      entityName={job.title}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                        {job ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <ApperIcon name={job ? "Save" : "Plus"} size={16} className="mr-2" />
                        {job ? "Update Job" : "Create Job"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JobModal;