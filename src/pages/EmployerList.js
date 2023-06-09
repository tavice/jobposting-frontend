import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import {
  Typography,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import Paid from "@mui/icons-material/Paid";
import LocationOn from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import PsychologyIcon from "@mui/icons-material/Psychology";

const EmployerList = ({ baseUrl }) => {
  const [employerList, setEmployerList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [jobListings, setJobListings] = useState({});

  const fetchEmployerList = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/employers/?format=json`);
      const data = response.data;
      setEmployerList(data);
    } catch (error) {
      console.log(error);
    }
  }, [baseUrl]);

  const fetchJobListings = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/joblistings`);
      const data = response.data;
      const jobListings = data.reduce((acc, job) => {
        if (!acc[job.employer]) {
          acc[job.employer] = [];
        }
        acc[job.employer].push(job);
        return acc;
      }, {});
      return jobListings;
    } catch (error) {
      console.log(error);
      return {};
    }
  }, [baseUrl]);

  useEffect(() => {
    const getJobListings = async () => {
      const data = await fetchJobListings();
      setJobListings(data);
      setIsLoading(false);
    };
    fetchEmployerList();
    getJobListings();
  }, [fetchEmployerList, fetchJobListings]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredEmployers = employerList.filter((employer) => { //filtering through the employers and then within the employers, filtering through the job listings
    const jobListingsByEmployer = jobListings[employer.id];
    if (!jobListingsByEmployer) return false;
    return jobListingsByEmployer.some((job) =>
      job.jobtitle.toLowerCase().includes(filter.toLowerCase())
    );
  });



  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography
            variant="h2"
            style={{ marginBottom: 40, alignItems: "center" }}
          >
            Current Jobs Available
          </Typography>
          <div className="filter-container">
            <label htmlFor="filter">Search Job Title:</label>
            <input
              type="text"
              id="filter"
              value={filter}
              onChange={handleFilterChange}
            />
          </div>
          {filteredEmployers.length > 0 ? (
            filteredEmployers.map((employer) => (
              <Grid
                container
                spacing={2}
                style={{ alignItems: "center", margin: 0 }}
                key={employer.id}
              >
                <Paper
                  elevation={3}
                  style={{
                    width: "80%",
                    alignItems: "center",
                    padding: 20,
                    margin: "auto",
                    marginBottom: 40,
                  }}
                >
                  <Grid
                    item
                    xs={12}
                    sm
                    container
                    style={{
                      justifyContent: "space-between",
                      marginBottom: 20,
                      marginTop: 20,
                    }}
                  >
                    <Typography variant="h3" gutterBottom>
                      {employer.companyname}
                    </Typography>
                    <div style={{ justifyContent: "center" }}>
                      <img
                        src={employer.logo}
                        alt="Company Logo"
                        height={100}
                      />
                    </div>
                    <Typography variant="body1" gutterBottom>
                      <LanguageIcon />{" "}
                      <a
                        href={employer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {employer.website}
                      </a>
                    </Typography>
                    <Typography variant="body1">
                      <LocationOn /> {employer.location}{" "}
                    </Typography>
                  </Grid>
                  <Divider style={{ height: 5 }} />
                  <Typography
                    variant="h4"
                    style={{ marginBottom: 40, marginTop: 40 }}
                  >
                    Open Roles:{" "}
                  </Typography>
                  {jobListings[employer.id] &&
                  jobListings[employer.id].length > 0 ? (
                    jobListings[employer.id]
                      .filter((job) =>
                        job.jobtitle.toLowerCase().includes(filter.toLowerCase())
                      )
                      .map((job) => (
                        <Paper
                          elevation={3}
                          style={{
                            width: "80%",
                            alignItems: "center",
                            padding: 20,
                            margin: "auto",
                            marginBottom: 20,
                          }}
                          key={job.id}
                        >
                          <Typography
                            variant="h5"
                            style={{ marginBottom: 20 }}
                          >
                            <Link to={`/Job Listings/${job.id}`}>
                              {job.jobtitle}
                            </Link>
                          </Typography>

                          <Stack
                            direction="row"
                            useFlexGap
                            flexWrap="wrap"
                            spacing={1}
                            style={{ padding: 20 }}
                          >
                            <Chip icon={<LocationOn />} label={job.location} />
                            <Chip icon={<Paid />} label={job.salary} />
                            <Chip
                              icon={<PsychologyIcon />}
                              label={job.jobrequirements}
                            />
                          </Stack>

                          <Typography variant="body1">
                            <strong>Description:</strong> {job.description}
                          </Typography>
                        </Paper>
                      ))
                  ) : (
                    <Typography variant="body1">
                      No job listings found.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">No job listings found.</Typography>
          )}
        </>
      )}
    </Container>
  );
};

export default EmployerList;
