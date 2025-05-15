# Requirements

## Functional Requirements

**ID:** TBR-01
**Title:** Display per sample feature counts
**Description:** The system shall display the total feature count of each sample in the stacked bar chart.
**Rationale:** This gives additional context when one sample has only one or few taxa present in the stacked bar.
**Source:** Github issue.
**Dependencies:** None.

**ID:** TBR-02
**Title:** Custom taxon coloring
**Description:** The system shall allow each taxon (i.e. each rectangle in each stacked bar) to be colored with a color of choice that is specifiable within the UI.
**Rationale:** This allows taxa of interest to be highlighted.
**Source:** Github issue.
**Dependencies:** None.

**ID:** TBR-03
**Title:** Clade-aware taxon coloring
**Description:** The system should allow the taxa at the displayed taxonomic depth to be colored with reference to their higher level taxonomic groupings. For example, when displaying genera, all genera belonging to one family may be colored in different opacities of red, while all genera belonging to another family may be colored in different opacities of blue, and so on. The higher level taxonomic group determines the color and the specific taxon determines the opacity of the color. The system should allow the level that defines the higher level groupings to be specifiable within the UI.
**Rationale:** Similar colors that differ only in opacity allow the user to visually recognize phylogenetic groupings. The number of colors needed to unqiuely identify the set of taxa at a higher taxonomic level will usually be much less than the number of colors needed to unqiuely identify the set of taxa at a lower level, leading to a less overwhelming number of colors in the stacked bar plot.
**Source:** Github issue.
**Dependencies:** None.

**ID:** TBR-04
**Title:** Metadata-based sample filtering
**Description:** The system should allow users to filter the set of samples displayed in the stacked bar chart according to corresponding data in the metadata. Categorical metadata columns should have an include/exclude option for each level in the column. Numerical metadata columns should have the option
to filter or retain values that are less than or greater than a specifiable value. Additionally, these filters should be logged in and removable through the UI.
**Rationale:** This functionality will make common exploratory workflows performable in real time within the visualization. Without this function, similar operations are possible only by using dedicated qiime2 actions.
**Source:** Github issue.
**Dependencies:**
- Each metadata filter should create a new sample label as described in **TBR-08**.

**ID:** TBR-05
**Title:** Abundance-based filtering
**Description:** The system shall allow the taxa displayed in the stacked bar to be filterable by absolute and relative abundance within each sample. The system shall display any applied filters in the UI and allow them to be removed.
**Rationale:** Taxa that fall beneath an abundance threshold may not be of concern and thus should not clutter the stacked bar chart. Alternatively, highly abundant taxa may not be of concern (e.g. because their presence is common and uninteresting) and thus should be removable to allow the lower
abundance taxa to become visible.
**Source:** Github issue.
**Dependencies:**
- Once abundance filters have been perfomed the axis adjustment options described in **TBR-06** become applicable.

**ID:** TBR-06
**Title:** Scale readjustment after filtering
**Description:** The system shall allow the relative abundance axis of the stacked bar chart to be displayed in the following ways after taxon filtering has been performed. By default, the filtered taxa will cease to be displayed in each stacked bar and the axis will continue to exend from 0% to 100% relative abundance, with a certain amount of empty space present in each stacked bar. Alternatively a user shall be able to renormalize each sample such that the scale continues to extend from 0% to 100% relative abundance, but with the relative abundances of the remaining taxa recomputed to sum to 100%--in this case there will be no empty space in the stacked bars.
**Rationale:** After filtering taxa from each sample the space that the filtered taxa occupied is wasted. Renormalizing allows this wasted space to be refilled, and the remaining taxa to be visualized more clearly.
**Source:** Github issue, Colin Wood.
**Dependencies:**
- The scale adjustment options listed here are only applicable if taxon
filtering as described in **TBR-05** has been performed.

**ID:** TBR-07
**Title:** Custom sample labeling
**Description:** The system shall allow the x-axis labels of each sample to be set manually to text that the user can specify within the UI.
**Rationale:** This allows user to keep track of certain samples of interest when samples are sorted. This also allows final touches to be made before exporting the stacked bar chart figure.
**Source:** Github issue.
**Dependencies:** None.

**ID:** TBR-08
**Title:** Multiple sample labels
**Description:** The system should allow each sample in the stacked bar chart to be labeled with any number of corresponding values from the metadata.
**Rationale:** This allows a user to spot trends that involve multiple metadata values.
**Source:** Github issue.
**Dependencies:**
- Any metadata filter created as described in **TBR-04** should be added automatically as an additional sample label.

**ID:** TBR-09
**Title:** Taxon sorting
**Description:** The system shall allow the taxa in each stacked bar chart to be sorted in the following ways: alphabetically, by mean absolute abundance, by mean relative abundance, and by prevalence. The system shall allow each of these sorts to be applied in either ascending or descending order. The system shall present the taxon legend, which displays the name of each taxon and its color in the stacked bar chart, in the order enforced by the sort. The system shall use the mean relative abundance (descending) sort by default.
**Rationale:** The abundance and prevalence sorts highlight taxa with the highest and lowest values of these criteria by placing them towards the top or bottom of the stacked bars. Alphabetic sorting allows the user to find taxa of interest by using a dictionary-like visual scan.
**Source:** Github issue.
**Dependencies:** None.

**ID:** TBR-10
**Title:** Figure exporting
**Description:** The system shall allow the stacked bar chart be exported as an .svg, .png, or .jpeg file. The exported figure shall contain the stacked bar chart, the axes, and optionally the legend. The user shall be able to specify the filename before exporting.
**Rationale:** This allows the user to save the stacked bar chart for future reference, for publication, and so on.
**Source:** Github issue.
**Dependencies:** None.

**ID:** TBR-11
**Title:**
**Description:**
**Rationale:**
**Source:**
**Dependencies:**

**ID:**
**Title:**
**Description:**
**Rationale:**
**Source:**
**Dependencies:**
