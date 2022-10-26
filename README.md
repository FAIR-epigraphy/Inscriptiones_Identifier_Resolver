# Inscriptiones Identifier Resolver
## 1. Background                
Epigraphers can obtain [Trismegistos](https://www.trismegistos.org/) Identifiers and other digital corpora identifiers from the [Trismegistos TexRelations MatcherAPI](https://www.trismegistos.org/dataservices/texrelations/documentation/) by providing the different source identifiers. This process takes time because epigraphers need to fetch TM IDs by providing them one-by-one from different source IDs; but it is also a non-trivial task for most epigraphers to query the API directly. The Inscriptiones Identifier Resolver (IDR) helps the epigrapher to fetch the ids in a more efficient, user friendly and less time-consuming way.


Inscriptiones Identifier Resolver (IDR) is the tool to fetch Trismegistos Identifiers (TM ID) using the TexRelations Matcher API by providing the different sources of identifiers and vice versa. For instance, the user uploads the CSV (input) file, and IDR returns the output that the epigrapher requires in a CSV file. A simple web-based user interface makes this a more user-friendly task.

## 2. Approach
We can achieve this process using the following technologies:

   - [Trismegistos TexRelations MatcherAPI](https://www.trismegistos.org/dataservices/texrelations/documentation/)
   - JavaScript for backend
   - HTML/CSS for front-end (GUI)

## 3. Methods
IDR has two main methods: a single identifier resolver and a multiple identifiers resolver.

### 3.1 Single Identifier Resolver

In this method, the user selects the data source and provides the relevant ID with which to fetch the other data source IDs, including the TM ID (discussed in section 4).

### 3.2 Multiple Identifiers Resolver
In this method, the user provides a CSV file that includes the known identifiers as input in order to fetch the corresponding TM IDs; or the user provides TM IDs as input in order to obtain other corresponding data source IDs.

- **Input File format (CSV)**

  The input file format must be in the required format. The required format is as follows:
   
  ![null](images/home/csv_file_format.png)
        
  In the above figure, the column headers of the CSV file are highlighted in orange. The first column should be your data source ID (optional). In this example, we have used I.Sicily data as the source ID, with the heading 'Id'. Other column headers must be in the JSON_Key format provided in the Trismegistos Matcher API data sources (see figure below). The values in each column must be in number format.
     
  ![null](images/home/tm_api_sources.png)

## 4. GUI (Graphical User Interface)
This tool has three pages (Home, [single ID](single.html) and [multiple ID](advance.html)). The Home page provides a project overview. The Single Id Resolver page is the interface for fetching the different source IDs corresponding to the provided ID.

  ![null](images/home/single_id_page_1.png)
  Figure 1: Single Id Resolver (First Look)

To use the Single Id Resolver, select the source of your input ID from the dropdown menu on the left; enter the ID number in the field on the right; and select ‘Go’.

  ![null](images/home/single_id_page_2.png)
  Figure 2: Single Id Resolver after fetching the IDs

The multiple ID page returns multiple IDs in response to the input CSV file. Use the ‘Browse’ button to select and upload the CSV file.
![null](images/home/multiple_id_page1.png)

The user selects the input column(s) from the CSV file that s/he wants to use to fetch the new IDs. If the user selects the Trismegistos (TM_ID) column, IDR should fetch any known corresponding IDs from other data sources. When the user selects the TM_ID column, the other columns in the grid will be disabled, and the Fetch button will appear on the page. 

![null](images/home/multiple_id_page2.png)

When clicking the Fetch button, the user will be presented with another menu listing all the available data sources. The user selects the required data sources that s/he wishes to be searched for corresponding IDs and downloaded.

![null](images/home/multiple_id_page_select_source.png)

After clicking on the Apply button, the Resolver will fetch the data from the Trismegistos Matcher API; progress is reported on the pop-up screen and can be paused / interrupted (and results to date downloaded) at any time.

![null](images/home/multiple_id_page_progress.png)

After completing the process, the user can download the file in CSV format.

## 5. Contributors
- [Jonathan Prag (Oxford, UK)](https://www.classics.ox.ac.uk/people/dr-jonathan-prag)
- [Imran Asif (Oxford, UK)](https://www.classics.ox.ac.uk/people/dr-imran-asif)

## 6. Acknowledgements
The Inscriptiones Identifier Resolver makes use of the [Trismegistos](https:/www.trismegistos.org/) [TexRelations Matcher API](https://www.trismegistos.orgdataservices/texrelations/documentation/) and the TM data available under a [CC-BY-SA4.0 licence](https://creativecommons.org/licenses/by-sa/4.0/).

For more on the Trismegistos project, see: 

    M. Depauw / T. Gheldof, 'Trismegistos. An interdisciplinary Platform for AncientWorld Texts and Related Information', 
    in: Ł. Bolikowski, V. Casarosa, P. Goodale, N. Houssos, P. Manghi, J. Schirrwagen (edd.), Theory and Practice of 
    DigitalLibraries - TPDL 2013 Selected Workshops (Communications in Computer andInformation Science 416), 
    Cham: Springer 2014, pp. 40–52.

![null](images/funders.png)
