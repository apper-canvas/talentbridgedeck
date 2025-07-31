import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { applicationService } from "@/services/api/applicationService";
import { jobService } from "@/services/api/jobService";
import { candidateService } from "@/services/api/candidateService";
import ApperIcon from "@/components/ApperIcon";
import MetricCard from "@/components/molecules/MetricCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Candidates from "@/components/pages/Candidates";
import Jobs from "@/components/pages/Jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    totalCandidates: 0,
activeJobs: 0,
    newCandidates: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadDashboardData = async () => {
try {
      setLoading(true);
      setError("");
      
      const [jobs, candidates, interviews] = await Promise.all([
        jobService.getAll(),
        candidateService.getAll(),
        applicationService.getUpcomingInterviews()
      ]);

// Calculate metrics
      const activeJobs = jobs.filter(job => (job.status_c || job.status) === "active").length;
      const newCandidates = candidates.filter(candidate => {
        const appliedDate = new Date(candidate.appliedAt_c || candidate.appliedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return appliedDate >= weekAgo;
      }).length;

      setMetrics({
        totalJobs: jobs.length,
        totalCandidates: candidates.length,
        activeJobs,
        newCandidates
      });

      // Get recent data
      setRecentJobs(jobs.slice(0, 5));
      setRecentCandidates(candidates.slice(0, 5));
      setUpcomingInterviews(interviews.slice(0, 5));

    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Loading variant="metrics" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Loading variant="list" />
          <Loading variant="list" />
        </div>
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-8">
    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
            title="Total Jobs"
            value={metrics.totalJobs}
            icon="Briefcase"
            change={8.5}
            changeType="positive" />
        <MetricCard
            title="Active Jobs"
            value={metrics.activeJobs}
            icon="CheckCircle"
            change={12.3}
            changeType="positive" />
        <MetricCard
            title="Total Candidates"
            value={metrics.totalCandidates}
            icon="Users"
            change={-2.1}
            changeType="negative" />
        <MetricCard
            title="New This Week"
            value={metrics.newCandidates}
            icon="UserPlus"
            change={15.7}
            changeType="positive" />
    </div>
{/* Recent Activity and Upcoming Interviews */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ApperIcon name="Briefcase" size={24} className="mr-3 text-primary-600" />Recent Jobs
                                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
{recentJobs.map(job => <div
                        key={job.Id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{job.title_c || job.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{job.company_c || job.company}</p>
                            <div className="flex items-center space-x-3">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(job.status_c || job.status) === "active" ? "bg-green-100 text-green-800" : (job.status_c || job.status) === "draft" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                                    {job.status_c || job.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {job.applicants_c || job.applicants || 0} applicants
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">
                                {format(new Date(job.createdAt_c || job.createdAt || job.CreatedOn), "MMM d")}
                            </p>
                        </div>
                    </div>)}
                </div>
            </CardContent>
        </Card>
        
        {/* Recent Candidates */}
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ApperIcon name="Users" size={24} className="mr-3 text-secondary-600" />Recent Candidates
                                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
{recentCandidates.map(candidate => <div
                        key={candidate.Id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                                <span className="text-white font-semibold text-sm">
                                    {(candidate.Name || candidate.name || '').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{candidate.Name || candidate.name}</h4>
                                <p className="text-sm text-gray-600 mb-1">{candidate.position_c || candidate.position}</p>
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(candidate.status_c || candidate.status) === "new" ? "bg-blue-100 text-blue-800" : (candidate.status_c || candidate.status) === "interviewed" ? "bg-purple-100 text-purple-800" : (candidate.status_c || candidate.status) === "hired" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {candidate.status_c || candidate.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">
                                {format(new Date(candidate.appliedAt_c || candidate.appliedAt), "MMM d")}
                            </p>
                        </div>
                    </div>)}
                </div>
            </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ApperIcon name="Calendar" size={24} className="mr-3 text-purple-600" />Upcoming Interviews
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingInterviews.length === 0 ? (
                        <div className="text-center py-8">
                            <ApperIcon name="Calendar" size={48} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-sm text-gray-500">No upcoming interviews</p>
                        </div>
                    ) : (
upcomingInterviews.map(interview => {
                            const interviewDate = new Date(`${interview.interview_date_c}T${interview.interview_time_c}`);
                            return (
                                <div
                                    key={interview.Id}
                                    className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {interview.interview_interviewer_c}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {interview.interview_type_c} Interview
                                            </p>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <ApperIcon name="Clock" size={14} className="text-purple-600" />
                                                <span className="text-sm text-purple-700">
                                                    {format(interviewDate, "MMM d, yyyy 'at' h:mm a")}
                                                </span>
                                            </div>
                                            {interview.interview_notes_c && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {interview.interview_notes_c}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                Scheduled
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
</div>
  );
};

export default Dashboard;