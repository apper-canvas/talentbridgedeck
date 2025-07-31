import React from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { Card, CardContent } from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const CandidateCard = ({ candidate, className, onView, appliedJobs = [], ...props }) => {
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "primary";
      case "interviewed":
        return "secondary";
      case "hired":
        return "active";
      case "rejected":
        return "inactive";
      default:
        return "default";
    }
  };

  const candidateName = candidate?.Name || candidate?.name || '';
  const candidateEmail = candidate?.email_c || candidate?.email || '';
  const candidatePosition = candidate?.position_c || candidate?.position || '';
  const candidateStatus = candidate?.status_c || candidate?.status || 'new';
  const candidateAppliedAt = candidate?.appliedAt_c || candidate?.appliedAt || new Date().toISOString();

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-lg">
                {candidateName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-display text-gray-900">
                {candidateName}
              </h3>
              <p className="text-sm text-gray-600">{candidatePosition}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(candidateStatus)}>
            {candidateStatus}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Mail" size={16} className="mr-2 text-gray-400" />
            {candidateEmail}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Calendar" size={16} className="mr-2 text-gray-400" />
            Applied {format(new Date(candidateAppliedAt), "MMM d, yyyy")}
          </div>
        </div>
        
        {/* Applied Jobs Section */}
        {appliedJobs.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ApperIcon name="Briefcase" size={14} className="text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Applied to {appliedJobs.length} Jobs
              </span>
            </div>
            <div className="text-xs text-green-700 line-clamp-2">
              {appliedJobs.slice(0, 2).map(job => job.title_c || job.title).join(', ')}
              {appliedJobs.length > 2 && ` and ${appliedJobs.length - 2} more`}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <ApperIcon name="Calendar" size={12} className="mr-1" />
            Applied {format(new Date(candidateAppliedAt), "MMM d")}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView?.(candidate)}
              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
              title="View Profile"
            >
              <ApperIcon name="Eye" size={14} />
            </button>
            <button
              onClick={() => props.onEdit?.(candidate)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit Candidate"
            >
              <ApperIcon name="Edit" size={14} />
            </button>
            <button
              onClick={() => props.onContact?.(candidate)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Contact Candidate"
            >
              <ApperIcon name="Phone" size={14} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;