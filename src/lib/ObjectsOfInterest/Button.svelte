<!-- ObjectsOfInterest/Button.svelte -->
<script lang="ts">
  import Icon from "svelte-awesome";
  import { faSatellite } from "@fortawesome/free-solid-svg-icons";
  import { content, lastcontent } from "@/stores/modal.store";
  import ObjectsOfInterestModal from "./Modal.svelte";
  import { onMount, onDestroy } from "svelte";
  import { objectsOfInterestData, initializeStore } from "@/stores/ooi.store";

  // Reference to store functions
  let storeApi;
  
  onMount(() => {
    // Initialize store with sample data and fetch from API
    storeApi = initializeStore();
  });

  const toggleModal = () => {
    if ($content === ObjectsOfInterestModal) {
      $content = $lastcontent || undefined;
      $lastcontent = undefined;
    } else {
      $lastcontent = $content;
      $content = ObjectsOfInterestModal;
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
  on:click={toggleModal}
  title="Objects of Interest">
  <Icon scale={1.3} data={faSatellite} />
  <!-- Object count badge -->
  <div class="absolute -top-1 -right-1 bg-blue-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
    {$objectsOfInterestData.length}
  </div>
</div>