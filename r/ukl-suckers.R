# process ukl-suckers dataset

library(tidyverse)
library(lubridate)


# load --------------------------------------------------------------------

df_orig <- read_csv("../data/ukl-suckers-original.csv", col_types = cols(
  uid = col_character(),
  releaseLocation = col_character(),
  totalLength = col_double(),
  datetime = col_character(),
  lat = col_double(),
  long = col_double(),
  active = col_integer()
))

stopifnot(all(!is.na(df_orig)))


# transform ---------------------------------------------------------------

df <- df_orig %>% 
  select(
    uid,
    datetime,
    lat,
    lon = long,
    cohort = releaseLocation,
    length = totalLength,
    active
  ) %>% 
  arrange(datetime, uid) %>% 
  mutate(
    datetime = ymd_hms(datetime, tz = "US/Pacific"),
    season = case_when(
      month(datetime) <= 3 ~ "Winter",
      month(datetime) <= 6 ~ "Spring",
      month(datetime) <= 9 ~ "Summer",
      TRUE ~ "Fall",
    )
  )
  

# plots -------------------------------------------------------------------

df %>% 
  group_by(cohort) %>% 
  count() %>% 
  ggplot(aes(cohort, n)) +
  geom_col() +
  labs(title = "Cohort")
df %>% 
  group_by(active) %>% 
  count() %>% 
  ggplot(aes(active, n)) +
  geom_col() +
  labs(title = "Active")
df %>% 
  group_by(season = ordered(season, levels = c("Winter", "Spring", "Summer", "Fall"))) %>% 
  count() %>% 
  ggplot(aes(season, n)) +
  geom_col() +
  labs(title = "Season")
df %>% 
  group_by(date = floor_date(datetime, unit = "day")) %>% 
  count() %>% 
  ggplot(aes(date, n)) +
  geom_col() +
  labs(title = "Date")
df %>% 
  ggplot(aes(lon, lat)) +
  geom_point() +
  labs(title = "Location")
df %>% 
  ggplot(aes(length)) +
  geom_histogram() +
  labs(title = "Length")
df %>% 
  group_by(uid) %>% 
  count() %>% 
  ggplot(aes(n)) +
  geom_histogram() +
  labs(title = "Captures per Individual")


# export ------------------------------------------------------------------

df %>% 
  mutate(datetime = force_tz(datetime, "UTC")) %>% 
  write_csv("../data/ukl-suckers.csv")
