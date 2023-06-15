import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Paper } from "@mui/material";
import { Link } from "react-router-dom";

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} style={{padding:2, display:'flex'}}>
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
          <Grid item xs={12} sm={5} md={5} key={jobListing.id} style={{padding:2, display:'flex'}}>
            <Paper elevation={3} style={{width:'100%', padding:10}}>
            <Stack 
              direction="column" 
              spacing={2} 
              style={{
                margin:20, justifyContent: 'space-between' }}>
              <Typography component={Link} to={`/Job Listings/${jobListing?.id}`}> {jobListing.jobtitle}</Typography>
              <Chip label={jobListing.salary} />
              <Chip label={jobListing.location} />
              <Chip label={companyName} />
              <Chip label={savedDate} />
            </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Container>
  );
};

export default ListOfJobsYouSaved;
