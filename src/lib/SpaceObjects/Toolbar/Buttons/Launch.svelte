<script lang="ts">
  import Icon from "svelte-awesome";
  import { faRocket } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  onMount(() => {
  });

  import columnDefs from "../lib/Launch/SIT/columnDefs";
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
  import filterActionFunction from "../lib/Launch/FilterActionFunction";
  import { scenario } from "@/stores/settings.store";
  import { activeEntity } from "@/stores/entity.store";

  const { settings } = scenario;

  let lastLoaded: Date;

  const defaultToolbar: any = document.querySelector(".cesium-viewer-toolbar");

  const toggleModal = async () => {
    settings.ClockSettings.shouldAnimate.set(false);
    if (!$mode) {
   
    }

    $columnDefStore = columnDefs;
    if ((globalThis as any).viewer) {
      const dataSource: SpaceCatalogDataSource | any =
        (globalThis as any).viewer.dataSources.getByName(
          "spaceaware"
        )[0] as SpaceCatalogDataSource;
      if (!lastLoaded || dataSource.lastLoaded > lastLoaded) {
        lastLoaded = dataSource.lastLoaded;
        data.set(dataSource.COMBINEDOMMCAT as any);
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
  class="relative text-xl w-8 h-8 cesium-button p-1 text-white flex items-center justify-center cursor-pointer"
  on:click={toggleModal}>
  <Icon scale={1.2} data={faRocket} />
</div>

<style>
  :global(.ag-paging-row-summary-panel) {
    position: relative;
    left: 10px;
  }
</style>
