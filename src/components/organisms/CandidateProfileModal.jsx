import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { applicationService } from "@/services/api/applicationService";
import ApperIcon from "@/components/ApperIcon";
import ApplicationStatusPipeline from "@/components/molecules/ApplicationStatusPipeline";
import NotesList from "@/components/molecules/NotesList";
import FormField from "@/components/molecules/FormField";
import InterviewSchedulingModal from "@/components/organisms/InterviewSchedulingModal";
import Textarea from "@/components/atoms/Textarea";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const experienceLevels = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior Level (6-10 years)' },
  { value: 'lead', label: 'Lead/Principal (10+ years)' }
]

const availabilityOptions = [
  { value: 'available', label: 'Available', color: 'text-green-600 bg-green-50' },
  { value: 'busy', label: 'Busy', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'unavailable', label: 'Unavailable', color: 'text-red-600 bg-red-50' }
]

function CandidateProfileModal({ 
  isOpen, 
  onClose, 
  onSave, 
  candidate, 
  jobs = [], 
  applications = [],
  onStatusChange,
  onApplicationUpdate,
  mode = 'view' // 'view', 'edit', 'create'
}) {
// State management - MUST be called before any conditional returns
const [formData, setFormData] = useState({
    name: candidate?.Name || candidate?.name || '',
    email: candidate?.email_c || candidate?.email || '',
    phone: candidate?.phone_c || candidate?.phone || '',
    location: candidate?.location_c || candidate?.location || '',
    currentJobTitle: candidate?.currentJobTitle_c || candidate?.currentJobTitle || '',
    position: candidate?.position_c || candidate?.position || '',
    experienceLevel: candidate?.experienceLevel_c || candidate?.experienceLevel || 'entry',
    skills: candidate?.skills_c || candidate?.skills || [],
    resumeSummary: candidate?.resumeSummary_c || candidate?.resumeSummary || '',
    availability: candidate?.availability_c || candidate?.availability || 'available'
  });

  const [errors, setErrors] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [candidateApplications, setCandidateApplications] = useState(applications);

// Separate useEffect for form data initialization to prevent infinite loops
  useEffect(() => {
    if (candidate && (mode === "view" || mode === "edit")) {
      const candidateSkills = candidate.skills_c || candidate.skills || [];
      setFormData({
        name: candidate.Name || candidate.name || "",
        email: candidate.email_c || candidate.email || "",
        phone: candidate.phone_c || candidate.phone || "",
        location: candidate.location_c || candidate.location || "",
        currentJobTitle: candidate.currentJobTitle_c || candidate.currentJobTitle || "",
        position: candidate.position_c || candidate.position || "",
        experienceLevel: candidate.experienceLevel_c || candidate.experienceLevel || "entry",
        skills: Array.isArray(candidateSkills) ? candidateSkills : (candidateSkills ? candidateSkills.split(',') : []),
        resumeSummary: candidate.resumeSummary_c || candidate.resumeSummary || "",
        availability: candidate.availability_c || candidate.availability || "available"
      });
    }
  }, [candidate, mode]);

// Separate useEffect for applications to prevent re-render loops
  useEffect(() => {
    // Only update if applications is defined and has changed meaningfully
    if (applications && Array.isArray(applications)) {
      // Deep comparison to prevent unnecessary updates that cause infinite re-renders
      const currentAppsString = JSON.stringify(candidateApplications || []);
      const newAppsString = JSON.stringify(applications);
      
      if (currentAppsString !== newAppsString) {
        setCandidateApplications(applications);
      }
    } else if (!applications) {
      // Clear applications if none provided
      setCandidateApplications([]);
    }
  }, [applications, candidateApplications]);
  // Handle null candidate case for view/edit modes after hooks are initialized
  if (!candidate && mode !== 'create' && mode !== 'add') {
    return null;
  }
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!formData.currentJobTitle.trim()) {
      newErrors.currentJobTitle = "Current job title is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position applying for is required";
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = "At least one skill is required";
    }
    
    if (!formData.resumeSummary.trim()) {
      newErrors.resumeSummary = "Resume summary is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success(mode === "add" ? "Candidate added successfully!" : "Candidate updated successfully!");
      onClose();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error("Failed to save candidate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      if (onStatusChange) {
        await onStatusChange(applicationId, newStatus);
      }
      
      setCandidateApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
      toast.success("Application status updated successfully!");
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleInterviewSchedule = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setShowInterviewModal(true);
  };

  const handleScheduleInterview = async (interviewData) => {
    try {
      if (onApplicationUpdate) {
        await onApplicationUpdate(selectedApplicationId, interviewData);
      }
      toast.success("Interview scheduled successfully!");
      setShowInterviewModal(false);
      setSelectedApplicationId(null);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error("Failed to schedule interview. Please try again.");
    }
  };
const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
      
      // Clear skills error if it exists
      if (errors.skills) {
        setErrors(prev => ({
          ...prev,
          skills: ""
        }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const getAvailabilityDisplay = (availability) => {
    const option = availabilityOptions.find(opt => opt.value === availability);
    return option || availabilityOptions[0];
  };

  if (!isOpen) return null;

return (
    <>
    <AnimatePresence>
    <motion.div
        initial={{
            opacity: 0
        }}
        animate={{
            opacity: 1
        }}
        exit={{
            opacity: 0
        }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}>
        <motion.div
            initial={{
                scale: 0.95,
                opacity: 0
            }}
            animate={{
                scale: 1,
                opacity: 1
            }}
            exit={{
                scale: 0.95,
                opacity: 0
            }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
                <div>
                    <h2 className="text-2xl font-bold font-display text-gray-900">
{mode === "add" ? "Add New Candidate" : mode === "edit" ? "Edit Candidate" : "Candidate Profile"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {mode === "add" ? "Create a detailed candidate profile" : mode === "edit" ? "Update candidate information" : "View and manage candidate information"}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ApperIcon name="X" size={24} />
                </button>
            </div>
<form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold font-display text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Full Name" required error={errors.name}>
                      <Input
                        value={formData.name}
                        onChange={e => handleInputChange("name", e.target.value)}
                        placeholder="Enter full name"
                        error={errors.name}
                        disabled={mode === "view"} />
                    </FormField>
                    <FormField label="Email" required error={errors.email}>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={e => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                        error={errors.email}
                        disabled={mode === "view"} />
                    </FormField>
                    <FormField label="Phone" required error={errors.phone}>
                      <Input
                        value={formData.phone}
                        onChange={e => handleInputChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                        error={errors.phone}
                        disabled={mode === "view"} />
                    </FormField>
                    <FormField label="Location" required error={errors.location}>
                      <Input
                        value={formData.location}
                        onChange={e => handleInputChange("location", e.target.value)}
                        placeholder="City, State/Country"
                        error={errors.location}
                        disabled={mode === "view"} />
                    </FormField>
                  </div>
                </div>
                
                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold font-display text-gray-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Current Job Title" required error={errors.currentJobTitle}>
                      <Input
                        value={formData.currentJobTitle}
                        onChange={e => handleInputChange("currentJobTitle", e.target.value)}
                        placeholder="Current position"
                        error={errors.currentJobTitle}
                        disabled={mode === "view"} />
                    </FormField>
                    <FormField label="Position Applying For" required error={errors.position}>
                      <Input
                        value={formData.position}
                        onChange={e => handleInputChange("position", e.target.value)}
                        placeholder="Desired position"
                        error={errors.position}
                        disabled={mode === "view"} />
                    </FormField>
                    <FormField label="Experience Level" required>
                      <select
                        value={formData.experienceLevel}
                        onChange={e => handleInputChange("experienceLevel", e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={mode === "view"}>
                        {experienceLevels.map(level => <option key={level.value} value={level.value}>
                          {level.label}
                        </option>)}
                      </select>
                    </FormField>
                    <FormField label="Availability Status" required>
                      <select
                        value={formData.availability}
                        onChange={e => handleInputChange("availability", e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={mode === "view"}>
                        {availabilityOptions.map(option => <option key={option.value} value={option.value}>
                          {option.label}
                        </option>)}
                      </select>
                    </FormField>
                  </div>
                </div>
                
                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold font-display text-gray-900 mb-4">Skills & Expertise</h3>
                  <FormField label="Skills" required error={errors.skills}>
                    {(mode === "add" || mode === "edit") && <div className="flex gap-2 mb-3">
                      <Input
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a skill and press Enter"
                        className="flex-1" />
                      <Button type="button" onClick={handleAddSkill} variant="outline" size="default">
                        <ApperIcon name="Plus" size={16} />
                      </Button>
                    </div>}
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map(
                        (skill, index) => <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          {(mode === "add" || mode === "edit") && <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-red-500">
                            <ApperIcon name="X" size={12} />
                          </button>}
                        </Badge>
                      )}
                      {formData.skills.length === 0 && <p className="text-sm text-gray-500">No skills added yet</p>}
                    </div>
                  </FormField>
                </div>
                
                {/* Resume Summary */}
                <div>
                  <h3 className="text-lg font-semibold font-display text-gray-900 mb-4">Professional Summary</h3>
                  <FormField label="Resume Summary" required error={errors.resumeSummary}>
                    <Textarea
                      value={formData.resumeSummary}
                      onChange={e => handleInputChange("resumeSummary", e.target.value)}
                      placeholder="Brief summary of professional background, key achievements, and career objectives..."
                      rows={4}
                      error={errors.resumeSummary}
                      disabled={mode === "view"} />
                  </FormField>
                </div>

{/* Communication Notes */}
                <div className="border-t border-gray-200 pt-6">
                  <NotesList
                    entityType="candidate"
                    entityId={candidate?.Id}
                    entityName={candidate?.name}
                  />
                </div>

                {/* Application Status Management */}
{/* Application Status Management */}
                {(mode === "view" || mode === "edit") && candidate && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ApperIcon name="Briefcase" className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
                    </div>
                    
                    {candidateApplications?.map(application => (
                      <div key={application?.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{application?.jobTitle}</h4>
                            <p className="text-sm text-gray-600">{application?.company}</p>
                          </div>
                          <Badge 
                            variant={application?.status === 'hired' ? 'success' : 
                                   application?.status === 'rejected' ? 'danger' : 'primary'}
                          >
                            {application?.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                        
                        <ApplicationStatusPipeline
                          currentStatus={application?.status}
                          onStatusChange={(newStatus) => handleStatusChange(application?.id, newStatus)}
                          showActions={mode === 'edit'}
                        />
                        
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInterviewSchedule(application?.id)}
                            className="text-primary-600 border-primary-200 hover:bg-primary-50"
                          >
                            <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                            Schedule Interview
                          </Button>
                        </div>
                      </div>
                    )) || []}
                    
                    {(!candidateApplications || candidateApplications.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <ApperIcon name="FileX" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No applications found for this candidate</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                <Button type="button" variant="ghost" onClick={onClose}>
                  {mode === "view" ? "Close" : "Cancel"}
                </Button>
                {(mode === "add" || mode === "edit") && (
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2">
                    {isSubmitting && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
                    {isSubmitting ? (mode === "add" ? "Adding..." : "Updating...") : (mode === "add" ? "Add Candidate" : "Update Candidate")}
                  </Button>
                )}
              </div>
            </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    {/* Interview Scheduling Modal */}
    <AnimatePresence>
      {showInterviewModal && (
        <InterviewSchedulingModal
          isOpen={showInterviewModal}
          onClose={() => {
            setShowInterviewModal(false);
            setSelectedApplicationId(null);
          }}
          onSchedule={handleScheduleInterview}
          applicationId={selectedApplicationId}
        />
      )}
    </AnimatePresence>
</>
  );
}

export default CandidateProfileModal;