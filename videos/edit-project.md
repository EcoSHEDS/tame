## Editing A Project

Welcome to this tutorial on editing a project in TAME.

So we'll use our tutorial project of the Deerfield River from the previous videos.

And say we want to update the dataset, or change some of the other configuration settings.

To do so, we'll start by clicking the edit button.

This will open the same multi-step form we used to create the project originally.

In the first step, we can update the dataset. For example, maybe we've collected more data or we've calculated some new variables.

Here I've got a new version of the Deerfield River dataset, which includes more observations and an additional column.

Note that originally, we had about 3,000 rows.

And if I select the file updated containing the updated dataset from my computer, then we that this new file has over 4000 rows, and also there is an additional column named season.

One thing to note is that TAME does not support appending new rows to an existing dataset. So to update the dataset, you must replace whole thing.

Also note that TAME does not support dataset versioning, so once you update the dataset, there is no way to go back to a previous version other than re-loading the original file.

Once the new file is loaded, TAME will check the remaining settings, and see if there are any errors in any of the steps.

And we see that there is an error on the second step, so let's take a look at that.

And the problem is that the ID column is no longer specified. This highlights one common issue when updating a dataset, which is that you might rename one or more columns and now tame no longer knows which column goes with each primary variable.

But we can fix that, but going to the second step and selecting the new column from the dropdown.

Another similar problem is to forget to format the timestamp column to use year-month-day format. In that case, you'll need to reformat the column in Excel, and then reload it in the first step.

But now, everything looks good, so we go to the next step.

And here we've got the original three variables, as well as the new fourth variable. So we can set the label, and options for that one.

And we'll continue to the dataset aggregation step. Our dataset is still relatively small, so no aggregation is necessary.

If if it were much larger and had more than 10,000 rows, then TAME would recommend choosing one of the two aggregation methods.

But we're good for now, so we'll continue to the last step.

And now TAME warns us that these changes will not be automatically saved to the server.


In other words, the new dataset will only used locally within the browser. If I close the project now, that change would be lost.

So in order to upload the new dataset to the server, I simply need to save the project again.

So let's save these changes first, and check that the dataset was loaded correctly. And we see that it now has over 4 thousands from the new dataset.

So now I'll click the Save button to save these updates to the server.

And I'll make a note in the description saying it was updated.

And then submit.

And now if I go to the Load Projects screen, we see that the project has indeed been updated on teh server.

And that wraps up this tutorial on editing a project.

Be sure to check out more of our videos as they become available.





