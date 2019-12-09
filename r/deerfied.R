# process deerfield dataset

library(tidyverse)
library(lubridate)


# load --------------------------------------------------------------------

df_orig <- read_csv("~/Dropbox/SHEDS/tame/data/deerfield/20191206/telemetryDataFinal telemetryDataFinal_2019-12-06 13_52_00_.csv", col_types = cols(
  X1 = col_double(),
  taggingSite = col_character(),
  tagID = col_double(),
  forkLength = col_double(),
  adiposeClip = col_character(),
  sex = col_character(),
  dateTime = col_character(),
  lon = col_double(),
  lat = col_double(),
  dayNight = col_character()
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
    sex,
    day_night
  ) %>% 
  arrange(datetime, uid) %>% 
  mutate(
    datetime = ymd_hms(datetime, tz = "US/Eastern")
  )
summary(df)

# domains -----------------------------------------------------------------

df$fork_length %>% summary
df$tagging_site %>% unique() %>% sort() %>% str_c('"', ., '"', collapse = ", ")
df$adipose_clip %>% table
df$sex %>% table
df$day_night %>% table
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
  ggplot(aes(day_night)) +
  geom_histogram(stat = "count") +
  labs(title = "Day/Night")
df %>% 
  group_by(uid) %>% 
  count() %>% 
  ggplot(aes(n)) +
  geom_histogram() +
  labs(title = "Captures per Individual")


# export ------------------------------------------------------------------

df %>% 
  mutate(datetime = force_tz(datetime, "UTC")) %>% 
  write_csv("../public/data/deerfield/data.csv")
