# Mass-Shootings-in-America

### What this project is about?
For this project I chose to analyze and visualize mass shootings in America over the last 40 years. The data was collected from Mother Jones website (an investigative news organization) in a CSV format. Some of the key attributes of the incidents are, fatalities and injuries, location type, shooter’s demographics and mental health, and weapons used. 

### Process:

* Data collection and Cleaning
* Preliminary data analysis and visualization in Jupyter Notebook
* Python Flask - Defining API Routes 
* Backend Development
* Dashboard Design   

### Interactive Dashboard: Landing Page

This page helps user understand the analysis and visualization of the incidents since 1982. 
   * User can choose from shooter's Age and/or Race to plot the incidents on the map (bubble map). 
   * User can hover over the bubbles to get more information
   * User can navigate to Map View, Chart View and Table View pages

The second map, choropleth map animates to display the incidents in each state (if any) from 1982 to 2021. 

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/MSA_landing_page.png)

### Interactive Dashboard: Map View

   * This map is created using Leaflet. 
   * User can choose from Incidents or Shooter-Details overlays
   * Popups display the incident and/or shooter details 
   * User can navigate to Home page, Chart View and Table View pages

#### Incident Details:

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/MSA_map_incident_detail_small.png)

#### Shooter Details:

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/MSA_map_shooter_details_small.png)

### Interactive Dashboard: Chart View

   * Bar chart and Pie chart update when user chooses from Shooter's Age, Race or Location Type
   * User can navigate to Home page, Map View or Table View pages

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/dashboard-%20chart%20view_small.png)

### Interactive Dashboard: Table View

   * User can choose Shooter's Age and/or Race
   * User can sort, filter, order, and select the incidents to get desired results
   * User can navigate to Home page, Map View or Chart View pages

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/MSA_table_view_small.png)

### Analysis: 

* Age Group Analysis

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/age%20group%20analysis-%20small.png)

* Shooter Race Analysis

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/incident%20breakdown-%20race-small.png)

* Weapon Type Analysis

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/incident%20breakdown-%20weapon%20type-%20small.png)

* Number of Total Victims over the years

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/incident%20analysis-%20victims%20over%20years-%20small.png)

* Incident Occurrences - Google Maps heat layer

![](https://github.com/poonam-ux/Mass_Shootings_in_America/blob/main/images/incidents'%20google%20map-%20small.png)

