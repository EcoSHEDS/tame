# process deerfield dataset

library(tidyverse)
library(lubridate)


# load --------------------------------------------------------------------

df_orig <- read_csv("../data/deerfield-20191008.csv", col_types = cols(
  X1 = col_double(),
  taggingSite = col_double(),
  tagID = col_double(),
  forkLength = col_double(),
  dateTime = col_character(),
  lon = col_double(),
  lat = col_double(),
  date = col_date(format = "")
))

stopifnot(all(!is.na(df_orig)))


# transform ---------------------------------------------------------------

df <- df_orig %>% 
  select(-X1, -date) %>% 
  janitor::clean_names() %>% 
  select(
    uid = tag_id,
    datetime = date_time,
    lat,
    lon,
    tagging_site,
    fork_length
  ) %>% 
  arrange(datetime, uid) %>% 
  mutate(
    datetime = ymd_hms(datetime, tz = "US/Eastern"),
    tagging_site = sprintf("%02d", tagging_site)
  )
  

# domains -----------------------------------------------------------------

df$fork_length %>% summary
df$tagging_site %>% table

# plots -------------------------------------------------------------------

df %>% 
  group_by(tagging_site) %>% 
  count() %>% 
  ggplot(aes(tagging_site, n)) +
  geom_col() +
  labs(title = "Tagging Site")
df %>% 
  group_by(date = floor_date(datetime, unit = "day")) %>% 
  count() %>% 
  ggplot(aes(date, n)) +
  geom_col() +
  labs(title = "Date")
df %>% 
  ggplot(aes(lon, lat, color = tagging_site)) +
  geom_point() +
  labs(title = "Location")
df %>% 
  ggplot(aes(fork_length)) +
  geom_histogram() +
  labs(title = "Fork Length (mm)")
df %>% 
  group_by(uid) %>% 
  count() %>% 
  ggplot(aes(n)) +
  geom_histogram() +
  labs(title = "Captures per Individual")


# export ------------------------------------------------------------------

df %>% 
  mutate(datetime = force_tz(datetime, "UTC")) %>% 
  write_csv("../data/deerfield.csv")
