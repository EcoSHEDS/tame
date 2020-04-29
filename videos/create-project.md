Welcome to this tutorial on the Tagged Animal Movement Explorer, or TAME.

In this video, we'll walk through how to create a new project.

Each project consists of a dataset, and a series of settings and options that define how that dataset will be loaded and displayed in TAME.

So with that, let's get started.

## Part 1: Create A New Project

We'll start by clicking the New Project button, which brings us to this multi-step form.

The first step is to load our dataset containing the observed locations of our tagged individuals over time.

Here is an example dataset of Brown Trout in the Deerfield River, which we'll be using for this tutorial.

Each row corresponds to an observed location of one individual at a single point in time. Usually, there will be multiple rows for each individual representing its movement over over time.

The dataset must contain at a minimum these first four columns specifying the individual or tag ID, the timestamp, and the latitude and longitude.

The ID can be either numbers or a string of characters.

The timestamp must be provided in year-month-day hour-minute format. By default, Excel may use a different format like month/day/year.

So we need to apply the correct format by selecting the values in this column, going to the Format Cells option, selecting More Number Formats, then custom, and entering yyyy-mm-dd hh:mm.

The latitude and longitude columns must both be in decimal degrees, and not degrees minutes seconds. The longitudes should be negative for locations west of the central meridian such as the united states.

In addition to these four, that dataset can contain any number of columns containing other attributes about each observation or individual. Here we have the tagging site, fork length, and whether each observation was made during the day or at night.

TAME will only interpret blank cells as missing. So make sure that if you have any missing values, especially for numeric columns, that you leave the cells blank rather than use N/A or -9999.

And lastly, the columns can be in any order and you are free to use whatever column names you wish so long as there are no duplicates or blanks. If you export your dataset from R, make sure sure to exclude the rownames.

TAME can only load a dataset in comma-separate value or CSV format, which is a simple text file format that uses commas to delineate each column.

In Excel, we can export to a CSV file by going to File > Save As, and then choose CSV format. Note that there may be multiple types of CSV formats listed, if you have problems loading the file into TAME, then I would try one of the other CSV options.

Also note that if you close this file, and then open it again in Excel, it will automatically change the datetime format back to month/day/year. So if you intend to re-save it, make sure that you set the datetime column back to year-month-day format.



Now that our dataset is in a properly formatted CSV file, we can go back load it into TAME.

We select a file, choose our CSV file, and then TAME will attempt to read the file, and if successful, provide a summary including the size, nubmer of rows and columns names. Be sure to review this information to make sure your file was read correctly.

Everything looks good, so now can now continue to the next step.



In Step 2, we select the column names corresponding to each of the four primary variables.

TAME will take an educated guess at which columns go with which variable. Here's it already selected datetime for the timestamp, and the latitude and longitude columns. It does not guess the individual or tag ID column, so we have to select that manually from the list of all column names.

Once we're done with that we can click continue, and TAME will check that that each of these columns contains properly formatted values, such as timestamps in year-month-day format.

And we did not get any errors, so we are at Step 3 where we configure the additional variables in the dataset.



For each additional column, we need to tell TAME what this variable is and how to use it.

On the left is a list of these columns, which includes those that were not assigned to one of the four primary variables.

A green check mark indicates that the variable will be included in TAME. And wee see that by default, TAME will include all additional variables.

For each of these, we can provide a more informative label instead of the column name.

The second option defines what type of variable this is, either discrete or numeric. TAME will attempt to guess the variable type based on whether the first value of this column is a number. Sometimes, it guesses incorrectly, such as when a categorical variable is represented by integer values (0 and 1, for example).

Next we tell TAME what options this variable can be used for. By default, TAME will include each variable as an option for the map color variable, and for the crossfilters.

If it is a discrete variable, we can also set it as an option for the outline variable. However, TAME will only allow a variable be used for outlines if it has two unique values. For this Tagging Site variable, there were 10 unique values so TAME throws an error.


Whenever there is an error, TAME will also mark that variable with a red X.


So to get rid of this error, we can just unselect the Outline option.

Lastly, sometimes we might want to exclude a variable all together. In that case, you can click the Exclude Variable option, and TAME will simply ignore this column when it loads the dataset. Note that excluded variables are marked by an empty circle in the list.

But we want to keep this variable, so we'll unselect this and move on to the next variable.


First, we'll give this one a more descriptive label, and then we see that TAME correctly guessed that it is a numeric or continuous variable.

Therefore, this variable can be used not only for the Color, but also for the Size variable. However, it cannot be an outline variable since it is not discrete.

The last variable for day or night is also a discrete variable. But now, since it has only two unique values, day or night, it can be used as an outline option.

Now that we've gone through our variables and do not have any errors, we can Continue on to the fourth step.


Like most software, TAME may become sluggish or even crash if you try to load too big of a dataset.

From our initial testing, datasets with fewer than 10,000 rows seems to perform reasonably well across a range of computer hardware specs.

Larger datasets that have 10s or 100s of thousands of rows may start to cause problems.

However, in many cases, these larger datasets contain high frequency data where the locations were recorded at subdaily or even sub-hourly intervals, say every 15 minutes.

And since it usually the larger scale movements that are of interest, aggregating the dataset to daily time steps can reduce the number of rows while also preserving large scale spatial and temporal patterns.

TAME provides three options for dataset aggregation.

The first option is to perform no aggregation, in which case all of the rows will be loaded into TAME.

The second two options provide alternative ways of aggregating the dataset to daily time steps.

Option 2 will load only the row with the longest distance to the next location on each day and for each individual. Using this option ensures that TAME loads the observations associated wit hthe largest movements.

Alternatively, Option 3 will load only the first row of each day and for each individual. This option makes sense if you want to use a more consistent aggregation method across all days.

If the raw dataset has less than 10,000 rows, then TAME will notify you that the aggregation is optional. But if you have more than that amount, then TAME will instead recommend that you choose one of the two daily aggregation methods.

And sometimes, even with daily aggregation, a dataset can still be too large for TAME. If TAME finds that there will be 10,000 or more rows even with aggregation, then it will issue a warning. You can either continue at your own risk, or go back and reduce the size of your original dataset. Some ways to this would be to only include a subset of the individuals, or to focus the dataset on a shorter period of time.

In this case, we have a relatively small dataset with only 3,000 rows, so we'll leave the None option selected, and then continue to the final step.


TAME has now checked our dataset along with all of our settings, and did not find any errors. 

So can we can click Finish to load our new project and start using TAME.


At this point, the project has only been created locally within the web browser. None of the data or associated information has been sent to the server.

If I were to close my browser, then this project would be lost, and I would need to go through this process again to re-create this project.

But instead of that, I can save the project to the server, which will let me return to it later and also share it with other users.

And if I wanted to update the dataset or change any of the settings, I can edit the project at any time.

Please see the next videos on saving and editing a project for more information.
