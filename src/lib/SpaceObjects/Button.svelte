<!-- Settings.svelte -->
<script lang="ts">
  import Icon from "svelte-awesome";
  import { faSatellite, faDatabase } from "@fortawesome/free-solid-svg-icons";
  import columnDefs from "./lib/columnDefs";
  import { viewer } from "@/stores/viewer.store";
  import {
    datatableShow,
    data,
    columnDefs as columnDefStore,
    filterAction,
    rowID,
    defaultID,
  } from "@/stores/datatable.store";
  import { mode, closeMode } from "@/stores/menu.store";
  import type { SpaceCatalogDataSource } from "orbpro";
  import filterActionFunction from "./lib/FilterActionFunction";
  import { scenario } from "@/stores/settings.store";
  import getID from "./lib/getID";
  import GroupNumber from "@/lib/elements/GroupNumber.svelte";
  import { activeEntity } from "@/stores/entity.store";

  const { settings } = scenario;

  let lastLoaded: Date;
  let cachedCombinedOMMCAT: any[] = []; // Variable to store the cached combined data

  const defaultToolbar: any = document.querySelector(".cesium-viewer-toolbar");

  const toggleModal = async () => {
    settings.ClockSettings.shouldAnimate.set(false);
    if (!$mode) {
      $mode = "SpaceObjects";
      $filterAction = filterActionFunction;
      $datatableShow = true;
      $rowID = getID;
      defaultToolbar.style.display = "none";
      setTimeout(() => {
        $activeEntity = $activeEntity; //needed for datatable reactivity
      }, 100);
      $closeMode = () => {
        settings.ClockSettings.shouldAnimate.set(false);
        $mode = null;
        $datatableShow = false;
        $rowID = defaultID;
        defaultToolbar.style.display = "";
      };
    }

    $columnDefStore = columnDefs;
    if ((globalThis as any).viewer) {
      const dataSource: SpaceCatalogDataSource | any = (
        globalThis as any
      ).viewer.dataSources.getByName("spaceaware")[0] as SpaceCatalogDataSource;

      if (
        !lastLoaded ||
        !dataSource.lastLoaded ||
        dataSource.lastLoaded > lastLoaded
      ) {
        lastLoaded = new Date();
        dataSource.lastLoaded = lastLoaded;

        // Recalculate COMBINEDOMMCAT only if there's a new lastLoaded
        let COMBINEDOMMCAT = [];
        for (let j = 0; j < dataSource.entities.values.length; j++) {
          const entity = dataSource.entities.values[j];
          const properties = entity.properties;

          const thisOMM = properties.OMM.getValue(); // Assuming .getValue() returns the OMM data
          const thisCAT = properties.CAT.getValue(); // Assuming .getValue() returns the CAT data

          COMBINEDOMMCAT[j] = {} as any;

          // Iterate over OMM properties
          for (const prop in thisOMM) {
            if (thisOMM.hasOwnProperty(prop)) {
              COMBINEDOMMCAT[j][prop] = thisOMM[prop];
            }
          }

          // Iterate over CAT properties
          for (const prop in thisCAT) {
            if (thisCAT.hasOwnProperty(prop)) {
              COMBINEDOMMCAT[j][prop] = thisCAT[prop];
            }
          }
        }

        // Sort COMBINEDOMMCAT by NORAD_CAT_ID, parsing it as an integer
        COMBINEDOMMCAT.sort((a, b) => {
          return parseInt(a.NORAD_CAT_ID) - parseInt(b.NORAD_CAT_ID);
        });

        // Store the newly calculated combined data
        cachedCombinedOMMCAT = COMBINEDOMMCAT;
        data.set(cachedCombinedOMMCAT as any);
      }
    }
  };
</script>

<!-- Button to open the modal -->
<div
  tabindex="0"
  role="button"
  on:keydown={(e) => {
    if (e.key === "Enter" || e.key === "Space") toggleModal();
  }}
  class="relative text-white flex items-center text-md justify-center cursor-pointer"
  on:click={toggleModal}>
  <Icon scale={1.3} data={faDatabase} />
  <div class="absolute bottom-[1px] right-[0px]">
    <GroupNumber />
  </div>
</div>

<style>
  :global(.ag-paging-row-summary-panel) {
    position: relative;
    left: 10px;
  }
</style>
