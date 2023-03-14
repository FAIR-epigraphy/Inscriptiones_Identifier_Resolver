# Inscriptiones Identifier Resolver
## 1. Background                
A reference of the type "CIL I<sup>2</sup> 1221 = CIL VI 9499 = ILS 7472 = CLE 959 = ILLRP 793" is probably familiar to those who use epigraphic sources. In giving such a reference, what we are doing, formally, is saying that these different editions all describe the same original physical epigraphic text (these editions may in fact be slightly different, a point which the "=" symbol obscures, but they are all different interpretations of the same text). The reason we tend to give references in this form is because there are often multiple editions, and there is no one corpus where all the inscriptions are presented and to which all epigraphers can reasonably be assumed to have access (the original corpora projects which tried to achieve this, CIL and IG, are now often neither the most recent nor the most accessible editions). This situation is now further complicated by the creation of digital datasets of inscriptions, which each assign their own identifier, even when they reproduce an existing edition (so the above reference could, for example, be extended as "= EDR167214 = EDCS-19200211"). In the world of linked data in particular, what is missing in this situation is a single unique identifier, which serves to disambiguate such multiple references, and represents the individual inscription in the abstract, rather than through a particular edition. Such an identifier is now provided by the [Trismegistos number](https://www.trismegistos.org/about), which in turn makes it theoretically possible to connect up all existing identifiers.

![epigraphy-ids-tm](images/home/epigraphy-ids-tm.jpg)

Epigraphers can obtain [Trismegistos](https://www.trismegistos.org/) Identifiers and other digital corpora identifiers from the [Trismegistos TexRelations MatcherAPI](https://www.trismegistos.org/dataservices/texrelations/documentation/) by providing the different source identifiers. This process takes time because epigraphers need to fetch TM IDs by providing them one-by-one from different source IDs; but it is also a non-trivial task for most epigraphers to query the API directly. **The Inscriptiones Identifier Resolver (IDR)** helps the epigrapher to fetch the ids in a more efficient, user friendly and less time-consuming way.

As the TexRelations API of Trismegistos is a dynamic tool and new connections are added and some are changed and this interface may not keep pace with those changes, we encourage those who want to add live links to other projects to their websites to establish a direct query of the API (for which they can also contact the TM team). Also, TM would strongly appreciate it if you acknowledge the use of the API where appropriate, including when you access it through this interface.

**Inscriptiones Identifier Resolver (IDR)** is designed as a tool to fetch *Trismegistos Identifiers* (TM ID) using the `TexRelations Matcher API` by providing other epigraphic identifiers - and vice versa. For instance, the user uploads an input file (CSV) with inscription IDs from a project partnered with Trismegistos, and IDR returns an output file (CSV) with the IDs from other partner projects requested by the user, along with the original IDs. A simple web-based user interface makes this a more user-friendly task.

## 2. Approach
We can achieve this process using the following technologies:
   - [Trismegistos TexRelations MatcherAPI](https://www.trismegistos.org/dataservices/texrelations/documentation/)
   - JavaScript for backend
   - HTML/CSS for front-end (GUI)

## 3. Methods
IDR has two main interfaces: a single identifier resolver and a multiple identifier resolver.

### 3.1 Single Identifier Resolver
*Example scenario: I have a single ID from I.Sicily and I want to get the corresponding TM ID and all other corresponding IDs of the same inscription in other projects.*

In this method, the user selects the data source for the known ID and provides the relevant single ID with which to fetch the other data source IDs, including the TM ID (discussed in detail in section 4).

### 3.2 Multiple Identifiers Resolver
*Example scenario A: I have a CSV file with a combination of multiple I.Sicily IDs and EDR IDs and I want to get all corresponding TM IDs.*

*Example scenario B: I have a CSV file with multiple I.Sicily IDs and TM IDs and want to get all corresponding IDs in other projects (e.g. EDH and Ubit Erat Lupa).*

In this method, the user provides a CSV file that includes the known identifiers as input in order to fetch the corresponding TM IDs; or the user provides TM IDs as input in order to obtain other corresponding data source IDs.

- **Input File format (CSV)**

  The input file format must be in the required format. The required format is as follows:
   
  ![null](images/home/csv_file_format.png)
        
  In the above figure, the column headers of the CSV file are highlighted in orange. The first column should be your data source ID (optional). In this example, we have used I.Sicily data as the source ID, with the heading 'Id'. Other column headers must be in the JSON_Key format provided in the `Trismegistos Matcher API` data sources (see figure below). The values in each column must be formatted as a *number*. For testing you can use our sample CSV [I.Sicily example](https://github.com/FAIR-epigraphy/Inscriptiones_Identifier_Resolver/blob/main/sample/template.csv).
     
  ![null](images/home/tm_api_sources.png)

## 4. GUI (Graphical User Interface)
This tool has three pages (Home, [single ID](single.html) and [multiple ID](advance.html)). The *Home page* provides a project overview. 

### Single ID Resolver

The *Single ID Resolver* page is the interface for fetching the different source IDs corresponding to the provided ID.

  ![null](images/home/single_id_page_1.png)
  *Figure 1: Single ID Resolver (First Look)*

To use the `Single ID Resolver`, select the source of your input ID from the dropdown menu on the left; enter the ID number in the field on the right; and select `Go`. You can test what happens if you input `000003`.

  ![null](images/home/single_id_page_2.png)
  *Figure 2: Single ID Resolver after fetching the IDs*
  

### Multiple ID Resolver

The *Multiple ID resolver* page returns multiple IDs in response to the input CSV file. Use the `Browse` button to select and upload the CSV file.
![null](images/home/multiple_id_page1.png)

The user selects the input column(s) from the CSV file that s/he wants to use to fetch the new IDs. If the user selects the *Trismegistos (TM_ID)* column, IDR should fetch any known corresponding IDs from other data sources. When the user selects the *TM_ID* column, the other columns in the grid will be disabled, and the `Fetch` button will appear on the page. 

The CSV file has to be properly formatted. For testing you can use our sample CSV [I.Sicily example](https://github.com/FAIR-epigraphy/Inscriptiones_Identifier_Resolver/blob/main/sample/template.csv).

![null](images/home/multiple_id_page2.png)

When clicking the `Fetch` button, the user will be presented with another menu listing all the available data sources. The user selects the required data sources that s/he wishes to be searched for corresponding IDs and downloaded.

![null](images/home/multiple_id_page_select_source.png)

After clicking on the `Apply` button, the *Resolver* will fetch the data from the `Trismegistos Matcher API`; progress is reported on the pop-up screen and can be paused / interrupted (and results to date downloaded) at any time.

![null](images/home/multiple_id_page_progress.png)

After completing the process, the user can download the file in a CSV format to their local computer.

## 5. Limitation
The following datasources are not implemented by TM.
- The Deir el-Medina Database
- PSIOnline
- Lexicon Leponticum
- Papyrological Navigator
- State Archives of Assyria Online (URI's not working)
- Vindolanda
- Institut de Papyrologie de la Sorbonne
- Universitätsbibliothek Graz
- AMS Historica
- Inscriptiones Graecae
- Philippoi
- Museum of London
- Museo Egizio
- College of Arts and Sciences: Department of Classics
- Kyprianos
- Ancient Inscriptions of the Northern Black Sea
- Im Dialog mit der Antike – Inscriptiones Antiquae
- Attic Inscriptions Online (AIO)
- Relicta.org
- U.S. EPIGRAPHY PROJECT
- The Demotic Palaeographical Database Project
- Berlin-Brandenburgische Akademie der Wissenschaften
- Inscriptions of Aphrodisias Project
- CPI
- Perseids
- Recueil informatisé des inscriptions gauloises
- Mnamon - Ancient writing systems in the Mediterranean

## 6. Contributors
- [Jonathan Prag (Oxford, UK)](https://www.classics.ox.ac.uk/people/dr-jonathan-prag)
- [Imran Asif (Oxford, UK)](https://www.classics.ox.ac.uk/people/dr-imran-asif)

## 7. Acknowledgements
The **Inscriptiones Identifier Resolver** makes use of the [Trismegistos](https:/www.trismegistos.org/) [TexRelations Matcher API](https://www.trismegistos.orgdataservices/texrelations/documentation/) and the TM data available under a [CC-BY-SA 4.0 licence](https://creativecommons.org/licenses/by-sa/4.0/).

For more on the **Trismegistos** project, see: 

    M. Depauw / T. Gheldof, 'Trismegistos. An interdisciplinary Platform for AncientWorld Texts and Related Information', 
    in: Ł. Bolikowski, V. Casarosa, P. Goodale, N. Houssos, P. Manghi, J. Schirrwagen (edd.), Theory and Practice of 
    DigitalLibraries - TPDL 2013 Selected Workshops (Communications in Computer andInformation Science 416), 
    Cham: Springer 2014, pp. 40–52.

![null](images/funders.png)
