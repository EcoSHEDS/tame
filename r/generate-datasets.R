# generate series of synthetic datasets for testing

library(tidyverse)
library(glue)
library(lubridate)

# data1: vary # tags and # obs/tag

date_start <- ymd_hm(201901010000)
n_days <- 365

latitude_range <- c(41, 43)
longitude_range <- c(-75, -73)

n_tags <- 100
n_obs <- 20

dir.create(file.path("csv", "data1"), recursive = TRUE, showWarnings = FALSE)
for (n_tags in c(10, 100, 1000, 10000)) {
  for (n_obs in c(1, 2, 5, 10, 20, 50)) {
    # n_tags <- 100
    # n_obs <- 20

    cat(glue("{n_tags} - {n_obs} - {n_tags * n_obs}"), "\n")

    df <- crossing(
      id = seq(1, n_tags, by = 1),
      obs_id = seq(1, n_obs, by = 1)
    ) %>% 
      mutate(
        latitude = runif(n(), min = latitude_range[1], max = latitude_range[2]),
        longitude = runif(n(), min = longitude_range[1], max = longitude_range[2]),
        datetime = date_start + hours(round(runif(n(), min = 0, max = n_days * 24)))
      )
    
    write_csv(df, file.path("csv", "data1", glue("data1-{n_tags}-{n_obs}.csv")))
  }
}


# data2: vary timespan
date_start <- ymd_hm(201901010000)

latitude_range <- c(41, 43)
longitude_range <- c(-75, -73)

n_tags <- 100
n_obs <- 20
n_days <- 365

dir.create(file.path("csv", "data2"), recursive = TRUE, showWarnings = FALSE)
for (n_days in c(14, 119, 120, 364, 370, 365 * 2, 365 * 5, 365 * 10)) {
  # n_tags <- 100
  # n_obs <- 20
  
  cat(glue("{n_days}"), "\n")
  
  df <- crossing(
    id = seq(1, n_tags, by = 1),
    obs_id = seq(1, n_obs, by = 1)
  ) %>% 
    mutate(
      latitude = runif(n(), min = latitude_range[1], max = latitude_range[2]),
      longitude = runif(n(), min = longitude_range[1], max = longitude_range[2]),
      datetime = date_start + hours(round(runif(n(), min = 0, max = n_days * 24)))
    )
  
  df %>% 
    select(id, datetime, latitude, longitude) %>% 
    write_csv(file.path("csv", "data2", glue("data2-{n_days}.csv")))
}

summary(read_csv(file.path("csv", "data2", glue("data2-119.csv"))))
read_csv(file.path("csv", "data2", glue("data2-119.csv"))) %>% 
  arrange(datetime) %>% 
  tail()
