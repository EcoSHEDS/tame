# Introduction Video

Welcome to this introduction of the Tagged Animal Movement Explorer, or TAME.

TAME is an interactive data visualization tool for exploring spatial and temporal patterns of animal movements.

This video provides an overview of the core concepts and functionality needed to get started with TAME.

## Part 1: MAP

We'll begin by loading an existing project containing PIT tag data of endangered sucker fish from Upper Klamath Lake in southern Oregon.

Initially, the dataset is shown using circles representing to the observed locations of each individual.

This is your usual interactive web map where you can zoom and pan. And there are a series of basemaps to choose from including satellite imagry, topo maps, hydrography, or open street map.

By default, the circles are colored by the unique individual, or tag, ID.

If I hover the mouse over any given point, we'll see more information about this observation. For example, after being observed here in the Northern part of the lake, this individual was next observed 5 days later a location 19 km to the SE. The tooltip also shows this individual was observed a total of 10 times over a period of 67 days during which it traveled approximately 61 km. Note that all distances in TAME are calculated using the linear distance between each pair of circles. Distances may not always be accurate, such as in this case when the fish would have had to walk on land, but it should provide a reasonable approximation in most situations.

If I click on the point, then this individual will be selected so we can more clearly see where it was observed and how it moved by dimming the other individuals.

Hovering not only reveals the other locations where this individual was observed, and but it also adds directional arrows showing the movement between those locations. All movements that occured before the point are shown in blue, and all those after are shown in red. These arrows thus show how the individual moved before it got here, and where it went after.

And when I stop hoving, we continue to see the movement vectors for this individual because it is selected. I can unselect it by simply clicking on it again. And we're back to the beginning.

The map tab on the left hand side of the screen provides a series of options and settings for changing how the data are displayed.

The first few options determine which variables are used to assign the color, size, and outline of each circle.

For example, the color can be associated with metrics computed from all the observations for each individual such as the total number of observations or the total distance, or using metrics computed for each observation that represent how the individual moved from one location to the next.

Each dataset may also include a set of additional variables. In this case, we can color by cohort, individual length, activity or season. If I select cohort, then all the points are colored by one of the three values for each cohort. We can also set the size to say, length, and the outline to activity.

But for now I'll switch this back to where we started.

Below these options are a series of Display Settings.

We can adjust the transparency, add horizontal or vertical jitter which is helpful when there is a lot of overlap between the circles. Note that when you add jitter, the observations for each individual are shifted the same amount so that the movement patterns and distances remain intact.

Next, we can define when the map will show circles and when it will show the movement vectors.

By default, it will always show the circles, but only show vectors for the selected individuals.

But we could also switch this to always show the vectors, and only show circles for the selected.

And of course if you never show either, the map will be empty.

Lastly, you can disable the blue/red color of the vectors when you hover.

That does it for the map options and settings, next we'll talk more about selections.

## Part 2: SELECTION

Selecting one or more individuals can be useful for highlighting their observed locations and movements.

In Part 1, we selected an individual by simply clicking on it on the map.

But if we open the Selection tab on the left, we can explore a few additional ways of performing selections.

The dropdown at the top lists the IDs of each selected invididual. Currently we only have one, but we can add another by choosing from the list or by clicking additional points on the map.

The dropdown also supports auto complete, so you can type in the ID manually if you're looking for a specific individual. 150.38_29

We now have four individuals selected, as shown in the legend.

To unselect an individual you can click the close button next to its ID, or just click on it again on the map.

To unselect all individuals, click the clear button in the dropdown.

In addition to clicking on the map or using the dropdown, you can also select individuals by drawing selection areas. To do so, we click the Draw New Area button, and then draw a rectangle on the map. Any individuals that were observed at least once in this area will be selected.

We can then draw a second area, say here on the eastern shore. TAME has now selected two individuals that were observed both in the northern part of the lake, and also along the eastern shore. If we change Operation from Intersection to Union, then we select all individuals observed in EITHER area, but not necessary both.

Lastly, we can clear these selection areas, which will also unselect all, by clicking the Clear All button.

That covers Selections, in the last part we'll talk about crossfiltering.

## Part 3: CROSSFILTER

Crossfiltering is a powerful data visualization technique for exploring multi-variate datasets.

If we open the Crossfilters tab on the left, we see a dropdown menu at the top to select which variables we want to use as filters.

By default, TAME shows two filters, one for the individual ID, and next for the date. We'll talk about the ID filter at the end, so for now I'll close it.

Aside from the ID, each variable will be shown as an interactive histogram. The Date filter, for example, shows the number of observations per week.

Now I can click and drag on this histogram, then I set what is called the filter range. Here I've set the range to April 15 to June 1. The complete dataset has now been filtered to only include observations with a timestamp during this window. As a result, the map shows fewer points, and the legend indicates that we've filtered for 656 observations, which is about half of the dataset.

I can adjust the width of the window using the handles. And I can slide it back and forth. To clear a filter, you can click the reset button here, or simply click anywhere on the chart outside the filter range.

One thing you might use this for is to see how an individual moved through time. So let's select an individual first so we can see its movement vectors, and then set a date filter range  like before. At first we only see a few of the observations for this individual. But as I drag the window forward in time, we see new observations and vectors being added as they fall into the filter, and old ones disappear as they fall out. When the filter range gets to July and August, we no longer see any observations of this invidual. And as I slide from right to left, we travel back in time seeing the movements change in reverse. So what we've done here is to use the date filter to manually animate the dataset over time.

We can have multiple filters going on at once.

For example, let's add filters for the cohort and the individual length.

The cohort is a discrete variable so it shows the number of observations for each unique value.

We see the most observations were of individuals from the Rocky Point cohort.

Now let's say we are interested in looking at only the largest individuals.

Then we can set a filter range on the length variable for any value greater than, say, 230 mm.

Notice when I set this filter that the other two histograms update instantaneously to reflect only the filtered observations.

For example, the cohort filter now shows the most observations for the TNC cohort.

Based on this, we can infer that among the individuals with the greatest lengths, most were part of the TNC cohort.

To see this more clearly, let's go back to the Map tab, and change the color variable also to Cohort.

And now on the map we see most of the points in Blue, which is assigned to TNC.

Now let's say that we only want to focus on the TNC cohort. If I click the bar for TNC on the cohort filter, then I've applied a second filter to the dataset, in addition to the length filter that was already set. And so now the map only shows observations for TNC individuals with lengths greater than 230 mm.

Lastly, let's explore how these individuals moved over time.

If I filter for the first week of observations, then it appears there is only one point on the map.

However, the legend indicates that there are 7 observations from 7 unique tags. So these poitns must be overlapping. We can confirm this by going to the Map settings, and adding some horizontal jitter, which indeed reveals multiple observations at this location.

This make sense, since all individuals from the TNC cohort were released from this one location.

Now to better see how these individuals moved, let's set the Show Movement Vectors setting to always. And we see on the map where each of these 7 individuals moved to after their initial release.

Note that we only see the movement vectors for the observations that meet all three filter criteria.

But we can also hover over the end of any of these vectors to see all the movements for any individual.

Now let's go back to the crossfilters, and expand the date filter range to cover a roughly 1 month period.

The map now shows that most of the individuals travelled to the eastern shore.

And as we slide forward in time, we see that these individuals then moved to the western and central parts of the lake.

And as I slide back, we see it all in reverse.

Another useful thing we can do is to combine filtering with selections to compare the movement of one individual to the rest.

For example, we might notice that there was only individual that moved to the North from the release site. So we can click on this one to select it. And we see that after staying near the release site, this individual first moved north. A as I slide the time filter, we see that it then moved into the wetlands in the northwestern corner of the like, unlike most of the other large individuals from the TNC cohort that visited the eastern shore.

In addition to filtering by continuous or discrete variables, we can also filter the dataset by the individual tag ID.

First, let's clear the selections, and clear all of the filters using the reset buttons in teh legend.

Next, we'll go back to the Crossfilter tab, and add a filter for the Individual ID.

If I scroll to the bottom, then we see the ID filter, which is a dropdown similar to the one we saw in selections. We can choose one or more IDs from the list or use autocomplete to filter for a specific individual.  And now we see that the other histograms have updated since they now only include observations for this one individual.

For example, the date filter shows the nubmer of observations per week for this individual, and we can use this to see how this individual moved through time.

And the legend shows that our filtered dataset now includes 24 observations from only 1 tag.

Now it's important to understand that although they are similar, selecting individuals is not the same as filtering for individuals. Selections are for highlighting individuals on the map, and thus have no impact on the crossfilters. While filtering is about creating a subset of the dataset, which does change both the map and the histograms.

But sometimes you may find yourself with a set of selected individuals that you then want to filter for. To demonstrate this, let's select all individuals in the northern part of the lake by drawing a selection area. And we now have 9 individuals selected, but the dataset is not yet filtered.

To filter for these individuals, we go back to the Crossfilter tab, and click the Copy Selected IDs button. Now the dataset is filtered to include only these 9 individuals. They are also still selected, but I can unselect them all by clicking the reset button.

In summary, by using selections to highlight individuals, and crossfiltering to focus on a specific subset of the dataset, TAME provides a powerful data visualization tool for exploring the spatial and temporal patterns of animal movements.

If you have your own data that you would like to explore in TAME, be sure to check out our other videos to learn how to create, edit, and publish new projects.

Thank you for watching.
