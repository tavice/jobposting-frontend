import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

const ListOfJobsYouSaved = ({ baseUrl }) => {
  const jobSeekerId = localStorage.getItem("jobseeker_id");
  const [jobSaved, setJobSaved] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [jobSavedResponse, jobListingsResponse, employersResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/savedjobs`),
        axios.get(`${baseUrl}/api/joblistings`),
        axios.get(`${baseUrl}/api/employers`)
      ]);

      const jobSavedData = jobSavedResponse.data.filter(
        item => item.job_seeker === parseInt(jobSeekerId)
      );

      const jobListingsData = jobListingsResponse.data.filter(listing =>
        jobSavedData.some(application => application.job_listing === listing.id)
      );

      const employersData = employersResponse.data.filter(employer =>
        jobListingsData.some(listing => listing.employer === employer.id)
      );

      setJobSaved(jobSavedData);
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


  //=================================================================//
  //render

  //console.log("jobListings are", jobListings);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {jobListings.map((jobListing) => {
        const savedJob = jobSaved.find(
          (job) => job.job_listing === jobListing.id
        );
        const savedDate = savedJob ? savedJob.save_date : "Unknown Date";

        // Find the employer object
        const employer = employers.find(
          (e) => e && e.id === jobListing.employer
        );

        // Check if employer exists before accessing its properties
        const companyName = employer ? employer.companyname : "Unknown Company";

        return (
          <Grid item xs={12} sm={4} md={4} key={jobListing.id} style={{padding:2}}>
            <Stack direction="row" spacing={1} style={{ margin: 20}}>
              <Typography>{jobListing.jobtitle}</Typography>
              <Chip label={jobListing.salary} />
              <Chip label={jobListing.location} />
              <Chip label={savedDate} />
              <Chip label={companyName} />
            </Stack>
          </Grid>
        );
      })}
    </Container>
  );
};

export default ListOfJobsYouSaved;
