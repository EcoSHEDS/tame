# Introduction Video

Welcome to this introduction of the Tagged Animal Movement Explorer, or TAME.

TAME is an interactive data visualization tool for exploring spatial and temporal patterns of animal movements.

This video provides an overview of the core concepts and functionality needed to get started with TAME.

## Part 1: MAP

We'll start by loading an existing project containing PIT tag data of endangered sucker fish from Upper Klamath Lake in southern Oregon.

Initially, the dataset is shown using circles representing to the observed locations of each individual.

This is your usual interactive web map where you can zoom and pan. And there are a series of basemaps to choose from including satellite imagry, topo maps, hydrography, or open street map.

By default, the circles are colored by the unique individual, or tag, ID.

If I hover the mouse over any given point, we'll see more information about this specific observation, as well as some compute metrics describing the movement to the next location, and lastly a summary of the total movement of this individual. For example, after being observed at this location in the Northern part of the lake, this individual was next observed 5 days later at a location 19 km to the SE. And overall, this individual was observed 10 times over a period of 67 days during which it traveled approximately 61 km. Note that all distances are calculated using the linear distance between each pair of circles. This may not always be accurate, such as this case when the fish would have had to walk on land, but it should provide a reasonable approximation in most situations.

If I click on the point, then this individual will be selected allowing us to see more clearly where it was observed and how it moved by dimming all of the other individuals.

Hovering not only reveals the other locations where this individual was observed, and but it also adds directional arrows showing the movement between those locations. All movements that occured before the hovered point are shown in blue, and all those after are shown in red. These arrows thus indicate the movement history relative to the hovered point, showing how the individual moved before it got here, and where it went after.

And when I stop hoving, we continue to see the movement vectors for this individual because it is selected. I can unselect it by simply clicking on it again. And we're back to the beginning.

How the data are shown on the map can be changed using the settings in the Map tab.

The first few options determine which variables are used to assign the color, size, and outline of each circle.

For example, the color can be associated with metrics computed from all the observations for each individual such as the total distance, or for each distinct movement from one location to the next.

Each dataset may also include a set of additional variables. In this case, we can color by cohort, individual length, activity or season. If I select cohort, then all the points are colored by one of the three values for each cohort. We can also set the size to say, length, and the outline to activity.

But for now I'll switch this back to where we started.

Below these options are a series of Display Settings.

We can adjust the transparency, add horizontal or vertical jitter which is helpful when there is a lot of overlap between the circles. Note that when you add jitter, the observations for each individual are shifted the same amount so that the movement patterns and distances remain intact.

Next, we can define when the map will show circles and when it will show the movement vectors.

By default, it will always show the circles, but only show vectors for the selected individuals.

But we can change it to always show the vectors, and only show circles for the selected.

And of course if you never show either, the map will be empty.

Lastly, you can disable the blue/red color of the vectors when you hover, if you want.

## Part 2: SELECTION



## Part 3: CROSSFILTER

