import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const ClientModal = ({ isOpen, onClose, onSave, client = null }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    relationshipStatus: "prospect"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
    if (client) {
      setFormData({
        companyName: client.companyName_c || client.companyName || "",
        contactPerson: client.contactPerson_c || client.contactPerson || "",
        email: client.email_c || client.email || "",
        phone: client.phone_c || client.phone || "",
        address: client.address_c || client.address || "",
        relationshipStatus: client.relationshipStatus_c || client.relationshipStatus || "prospect"
      });
    } else {
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        relationshipStatus: "prospect"
      });
    }
    setErrors({});
  }, [client, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
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
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold font-display text-gray-900">
                  {client ? "Edit Client" : "Add New Client"}
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
                    label="Company Name"
                    required
                    error={errors.companyName}
                  >
                    <Input
                      placeholder="e.g. TechFlow Inc."
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      error={errors.companyName}
                    />
                  </FormField>

                  <FormField
                    label="Contact Person"
                    required
                    error={errors.contactPerson}
                  >
                    <Input
                      placeholder="e.g. John Smith"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      error={errors.contactPerson}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Email"
                    required
                    error={errors.email}
                  >
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      error={errors.email}
                    />
                  </FormField>

                  <FormField
                    label="Phone"
                    required
                    error={errors.phone}
                  >
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      error={errors.phone}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Address"
                  required
                  error={errors.address}
                >
                  <Textarea
                    placeholder="123 Business Street, City, State ZIP"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    error={errors.address}
                    rows={3}
                  />
                </FormField>

                <FormField
                  label="Relationship Status"
                >
                  <select
                    value={formData.relationshipStatus}
                    onChange={(e) => handleInputChange("relationshipStatus", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>

                <div className="flex items-center space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                        {client ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <ApperIcon name={client ? "Save" : "Plus"} size={16} className="mr-2" />
                        {client ? "Update Client" : "Create Client"}
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

export default ClientModal;