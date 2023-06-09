import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

const ListOfJobsYouAppliedTo = ({ baseUrl }) => {
  const [jobApplications, setJobApplications] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const jobSeekerId = localStorage.getItem("jobseeker_id");

  const fetchData = useCallback(async () => {
    try {
      const [jobApplicationResponse, jobListingsResponse, employersResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/jobapplications`),
        axios.get(`${baseUrl}/api/joblistings`),
        axios.get(`${baseUrl}/api/employers`)
      ]);

      const jobApplicationsData = jobApplicationResponse.data.filter(
        item => item.job_seeker === parseInt(jobSeekerId)
      );

      const jobListingsData = jobListingsResponse.data.filter(listing =>
        jobApplicationsData.some(application => application.job_listing === listing.id)
      );

      const employersData = employersResponse.data.filter(employer =>
        jobListingsData.some(listing => listing.employer === employer.id)
      );

      setJobApplications(jobApplicationsData);
      setJobListings(jobListingsData);
      setEmployers(employersData);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, [baseUrl, jobSeekerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {jobListings.map((listing) => {
        const employer = employers.find((e) => e.id === listing.employer);
        const jobApplication = jobApplications.find(
          (app) => app.job_listing === listing.id
        );
        const status = jobApplication
          ? jobApplication.application_status
          : "Unknown Status";
        let chipColor;

        if (status === "Pending") {
          chipColor = "warning";
        } else if (status === "Approved") {
          chipColor = "success";
        } else if (status === "Rejected") {
          chipColor = "error";
        } else {
          chipColor = "default";
        }

        return (
          <Grid container spacing={1} key={listing.id}>
            <Typography variant="h5" style={{ marginBottom: 10 }}>
              {listing.jobtitle} - {employer ? employer.companyname : ""} - {"  "}
              <Chip label={status} color={chipColor} />
            </Typography>
          </Grid>
        );
      })}
    </Container>
  );
};

export default ListOfJobsYouAppliedTo;
