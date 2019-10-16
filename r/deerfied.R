# process deerfield dataset

library(tidyverse)
library(lubridate)


# load --------------------------------------------------------------------

df_orig <- read_csv("../data/deerfield/deerfieldTelemetry_2019-10-15 144105_.csv", col_types = cols(
  X1 = col_double(),
  taggingSite = col_character(),
  tagID = col_double(),
  forkLength = col_double(),
  adiposeClip = col_character(),
  sex = col_character(),
  dateTime = col_character(),
  lon = col_double(),
  lat = col_double()
)) %>% 
  select(-X1)

stopifnot(all(!is.na(df_orig)))


# transform ---------------------------------------------------------------

df <- df_orig %>% 
  janitor::clean_names() %>% 
  select(
    uid = tag_id,
    datetime = date_time,
    lat,
    lon,
    tagging_site,
    fork_length,
    adipose_clip,
    sex
  ) %>% 
  arrange(datetime, uid) %>% 
  mutate(
    datetime = ymd_hms(datetime, tz = "US/Eastern")
  )
  

# domains -----------------------------------------------------------------

df$fork_length %>% summary
df$tagging_site %>% unique %>% str_c('"', ., '"', collapse = ", ")
df$adipose_clip %>% table
df$sex %>% table

# plots -------------------------------------------------------------------

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
  ggplot(aes(tagging_site)) +
  geom_histogram(stat = "count") +
  labs(title = "Tagging Site")
df %>% 
  ggplot(aes(adipose_clip)) +
  geom_histogram(stat = "count") +
  labs(title = "Adipose Clip")
df %>% 
  ggplot(aes(sex)) +
  geom_histogram(stat = "count") +
  labs(title = "Sex")
df %>% 
  group_by(uid) %>% 
  count() %>% 
  ggplot(aes(n)) +
  geom_histogram() +
  labs(title = "Captures per Individual")


# export ------------------------------------------------------------------

df %>% 
  mutate(datetime = force_tz(datetime, "UTC")) %>% 
  write_csv("../data/deerfield/data.csv")
