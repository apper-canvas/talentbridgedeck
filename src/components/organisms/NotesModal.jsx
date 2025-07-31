import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";

const NOTE_CATEGORIES = [
  { value: "Phone Call", icon: "Phone", color: "text-blue-600" },
  { value: "Email", icon: "Mail", color: "text-green-600" },
  { value: "Meeting", icon: "Users", color: "text-purple-600" },
  { value: "Follow-up", icon: "Clock", color: "text-orange-600" }
];

const NotesModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  note = null, 
  entityType, 
  entityId,
  entityName 
}) => {
  const [formData, setFormData] = useState({
    category: "Phone Call",
    content: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
    if (note) {
      setFormData({
        category: note.category_c || note.category || "Phone Call",
        content: note.content_c || note.content || ""
      });
    } else {
      setFormData({
        category: "Phone Call",
        content: ""
      });
    }
    setErrors({});
  }, [note, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.content.trim()) {
      newErrors.content = "Note content is required";
    }
    
    if (formData.content.trim().length > 1000) {
      newErrors.content = "Note content must be less than 1000 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }

    // Prevent accidental submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
const noteData = {
        entityType_c: entityType,
        entityId_c: entityId,
        category_c: formData.category,
        content_c: formData.content
      };
      
      await onSave(noteData);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const selectedCategory = NOTE_CATEGORIES.find(cat => cat.value === formData.category);

  return (
<AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold font-display text-gray-900">
                    {note ? "Edit Note" : "Add Note"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {entityType === 'candidate' ? 'Candidate' : 'Application'}: {entityName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="p-6 space-y-6">
                  <FormField label="Category" required>
                    <div className="grid grid-cols-2 gap-3">
                      {NOTE_CATEGORIES.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleInputChange("category", category.value)}
                          className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                            formData.category === category.value
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <ApperIcon 
                            name={category.icon} 
                            size={16} 
                            className={`mr-2 ${
                              formData.category === category.value
                                ? "text-primary-600"
                                : category.color
                            }`}
                          />
                          <span className={`text-sm font-medium ${
                            formData.category === category.value
                              ? "text-primary-900"
                              : "text-gray-700"
                          }`}>
                            {category.value}
                          </span>
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField
                    label="Note Content"
                    required
                    error={errors.content}
                  >
                    <Textarea
                      placeholder={`Add your ${formData.category.toLowerCase()} notes here...`}
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      error={errors.content}
                      rows={6}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Be specific about the interaction and next steps</span>
                      <span>{formData.content.length}/1000</span>
                    </div>
                  </FormField>
                </div>

                <div className="flex items-center space-x-3 p-6 border-t bg-gray-50">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                        {note ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <ApperIcon 
                          name={selectedCategory?.icon || "Plus"} 
                          size={16} 
                          className="mr-2" 
                        />
                        {note ? "Update Note" : "Add Note"}
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

export default NotesModal;