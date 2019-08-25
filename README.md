# autofilter
An autofilter for DataTables

## Introduction
I love [DataTables](http://datatables.net). I use it all the time at my work and it's so fun to work with. It has great defaults, well thoughtout API, and is very intuitive to use. It's always a hit and I wanted to add one important functionality: autofilter.

This idea came from Microsoft Excel's ability to automatically build a list of unique values for the user to choose from for a column to quickly filter data. Let's add that feature as a button to our DataTable!

I originally created a solution that was bound to only one table at a time. Therefore if you wanted to generalize the solution so that it worked with any number of tables on the page. 

## Code You Will Need
Before we get started, there are a few bits of code that you will need. The first is the [pubsub framework](https://github.com/bflanders/pubsub) I created. 

You will also need DataTabel with the [Button Extension](https://datatables.net/extensions/buttons/custom) to build our custom button. 

## The Problem 

## The Design
Below is a sketch of the design. Assume for now we are dealing with one parent table (far right). This is the DataTable that we would normally have on the page. We will add a "Filter" button which will bring up a "Column Modal".

![alt text](https://github.com/bflanders/autofilter/blob/master/design.png)

The Column Modal takes the columns of the table and presents in a table along the 
