<style>
  @keyframes highlight-fade {
    0% { background-color: rgba(255, 165, 0, 0.8); }
    70% { background-color: rgba(255, 165, 0, 0.5); }
    100% { background-color: transparent; }
  }
  
  .priority-highlight {
    animation: highlight-fade 3s ease-out;
    border-radius: 2px;
    padding: 0 4px;
  }
</style><script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { activeEvent } from "@/stores/events.store";
  import { activeGroup } from "@/stores/spacecatalog.group.store";
  import {
    Cartesian3,
    ClockRange,
    Color,
    ConstantProperty,
    JulianDate,
    SpaceEntity,
  } from "orbpro";
  import { type Entity } from "orbpro";
  import { HYPT } from "@/classes/standards/HYP/HYP";
  import { scenario } from "@/stores/settings.store";
    import { active } from "d3";
  const { trackedEntity } = scenario;

  let originalEntityProperties = new Map();
  const viewer = (globalThis as any).viewer;
  let scheduledUpdates = [];
  let flashingCells = new Map();
  let isDemoMode = false;
  let originalMatrix = null; 
  let originalPriority = null;
  let priorityFlashing = false; // Flag for priority highlighting
  
  onMount(() => {
    // Check if this is a demo event
    isDemoMode = !!$activeEvent?.DEMO;
    console.log("Demo mode:", isDemoMode);
    
    $activeGroup = "defaultGroup";
    const sDC = viewer?.dataSources.getByName("spaceaware")[0];
    setTimeout(() => 
      focusOnEntity($activeEvent?.ID), 1000);

    if ($activeEvent?.ID) {
      const entity = sDC?.entities.getById($activeEvent.ID);
      originalEntityProperties.set(entity, {
          pixelSize: entity.point.pixelSize,
          color: entity.point.color,
          show: entity.show
        });
      
      entity.point.color = Color.RED;
      entity.point.pixelSize = 10;
      if (entity.label) {
        entity.label.show = true;
      }
      (entity as SpaceEntity).showOrbit({show: true})
    }

    // Parse the start and end times
    const eventStartTimeString = ($activeEvent as HYPT)
      .EVENT_START_TIME as string;
    const eventEndTimeString = ($activeEvent as HYPT).EVENT_END_TIME as string;

    const eventStartTimeDate = new Date(eventStartTimeString);
    const eventEndTimeDate = new Date(eventEndTimeString);
    let startTime: JulianDate;
    let endTime: JulianDate;
    if (
      !isNaN(eventStartTimeDate.getTime()) &&
      !isNaN(eventEndTimeDate.getTime())
    ) {
      startTime = JulianDate.fromDate(eventStartTimeDate);
      endTime = JulianDate.fromDate(eventEndTimeDate);
      
      // Only set up scheduled updates if in demo mode
      if (isDemoMode) {
        originalMatrix = [...$activeEvent?.MATRIX];
        originalPriority = $activeEvent?.PRIORITY;
        scheduleMatrixUpdates(eventStartTimeDate);
      }
    } else {
      startTime = viewer.clock.currentTime;
      // Handle invalid dates here
      console.error("Invalid date format");
    }
    
    setTimeout(() => {
      viewer.clock.currentTime = startTime;
    }, 1000);
    
    // Only set up clock listener if in demo mode
    let clockTickListener = null;
    if (isDemoMode) {
      // Watch for clock changes to trigger updates based on time
      clockTickListener = viewer.clock.onTick.addEventListener((clock) => {
        const currentTime = JulianDate.toDate(clock.currentTime);
        checkScheduledUpdates(currentTime);
      });
      
      // Store the listener to remove it later
      originalEntityProperties.set('clockListener', clockTickListener);
    }
  });

  // Function to schedule matrix updates
  function scheduleMatrixUpdates(startTime) {
    // Schedule update 120 seconds after event start
    const update1Time = new Date(startTime.getTime() + 120000);
    scheduledUpdates.push({
      time: update1Time,
      update: () => {
        console.log("Executing scheduled update 1");
        // Update VMAG and AMR from null to true
        if ($activeEvent?.MATRIX) {
          // Create a deep copy of the activeEvent
          const updatedEvent = {...$activeEvent};
          const matrixCopy = [...updatedEvent.MATRIX];
          
          // VMAG is index 1, AMR is index 2 in the first row
          matrixCopy[1] = true; // Update VMAG
          matrixCopy[3] = true; // Update AMR
          
          // Update the matrix in the copy
          updatedEvent.MATRIX = matrixCopy;
          // updatedEvent.PRIORITY = 2
          
          // Mark these cells for flashing
          flashCell(0, 1); // Row 0, Col 1 (VMAG)
          flashCell(0, 3); // Row 0, Col 2 (AMR)
          
          // Update the activeEvent store with the new object to trigger Svelte reactivity
          $activeEvent = updatedEvent;
        }
      },
      executed: false
    });
    

const priorityUpdateTime = new Date(startTime.getTime() + 130000);
scheduledUpdates.push({
  time: priorityUpdateTime, 
  update: () => {
    console.log("Updating priority from 4 to 2");
    
    // Get latest version from the store
    const currentEvent = $activeEvent;
    
    // Create updated event with new priority
    const updatedEvent = {
      ...currentEvent,
      PRIORITY: "2" // Change priority from 4 to 2
    };
    const newMatrix = [...$activeEvent?.MATRIX];
    newMatrix[3] = 1;
    updatedEvent.MATRIX = newMatrix;
    
    // Start priority flashing
    priorityFlashing = true;
    setTimeout(() => {
      priorityFlashing = false;
    }, 3000); // Flash for 3 seconds
    
    // Update the store directly
    activeEvent.set(updatedEvent);
  },
  executed: false
});
  }
  
  function checkScheduledUpdates(currentTime) {
    let updatesExecuted = false;
    
    scheduledUpdates.forEach(update => {
      if (!update.executed && currentTime >= update.time) {
        console.log(`Executing update scheduled for ${update.time}`);
        update.update();
        update.executed = true;
        updatesExecuted = true;
      }
    });
    
    if (updatesExecuted) {
      // Maybe add a notification or indicator here if needed
      console.log("Updates applied to matrix");
    }
  }
  
  // Function to make a cell flash green
  function flashCell(rowIndex, colIndex) {
    const cellKey = `${rowIndex}-${colIndex}`;
    flashingCells.set(cellKey, true);
    // flashingCells = new Map(flashingCells); // Force Svelte reactivity
    
    console.log(`Flashing cell at ${rowIndex}-${colIndex}`);
    
    // Stop flashing after 2 seconds
    setTimeout(() => {
      flashingCells.delete(cellKey);
      // flashingCells = new Map(flashingCells); // Force Svelte reactivity
    }, 2000);
    console.log(`Flashing Cells ${flashingCells}`)
  }

  onDestroy(() => {
    $activeGroup = "defaultGroup";
    const sDC = (globalThis as any).viewer?.dataSources.getByName(
      "spaceaware"
    )[0];

    // Remove clock listener
    const clockListener = originalEntityProperties.get('clockListener');
    if (clockListener) {
      viewer.clock.onTick.removeEventListener(clockListener);
    }
    
    // Clear scheduled updates
    scheduledUpdates = [];

    // Reset event matrix
    if (isDemoMode) {
      $activeEvent.MATRIX = originalMatrix;
      $activeEvent.PRIORITY = originalPriority;
    }
    
    // Restore previous point configuration onDestroy and show all entities
    originalEntityProperties.forEach((props, e) => {
      if (e !== 'clockListener') { // Skip the listener entry
        e.point.pixelSize = props.pixelSize;
        e.point.color = props.color;
        (e as SpaceEntity).showOrbit({ show: false });
        e.show = true;
      }
    });

    // Restore label settings onDestroy
    sDC?.entities.values.forEach((e: Entity) => {
      e.show = true;
      if (e.label) {
        e.label.show = new ConstantProperty(false); // Hide labels onDestroy
      }
    });

    (globalThis as any).viewer!.scene.render;
    $activeEvent = new HYPT();
    originalEntityProperties = new Map();
  });

  $: extraRows =
    Math.ceil(
      ($activeEvent?.MATRIX?.length || 0) /
        ($activeEvent?.COL_INDICATORS?.length || 1)
    ) - ($activeEvent?.ROW_INDICATORS?.length || 0);

  function getCellClass(rowIndex: any, colIndex: any) {
    const matrixIndex =
      rowIndex * ($activeEvent?.COL_INDICATORS?.length || 0) + colIndex;
    
    // Cell flashing logic
    const cellKey = `${rowIndex}-${colIndex}`;
    if (flashingCells.has(cellKey)) {
      return "bg-red-600 animate-pulse transition-colors duration-300";
    }
    
    if ($activeEvent?.MATRIX[matrixIndex] === null) {
      return "";
    }
    if (matrixIndex < ($activeEvent?.MATRIX?.length || 0)) {
      return $activeEvent?.MATRIX[matrixIndex] ? "bg-red-600 transition-colors duration-300" : "bg-green-600 transition-colors duration-300" ;
    }
    return "";
  }

  function getCellValue(rowIndex: any, colIndex: any) {
    const matrixIndex =
      rowIndex * ($activeEvent?.COL_INDICATORS?.length || 0) + colIndex;
    if ($activeEvent?.MATRIX[matrixIndex] === null) {
      return "";
    }
    if (matrixIndex < ($activeEvent?.MATRIX?.length || 0)) {
      return $activeEvent?.MATRIX[matrixIndex] ? "Alert" : "Normal";
    }
    return "";
  }

  // Function to set the clock to a specific time
  function setClockToTime(timeString: string) {
    const time = JulianDate.fromDate(new Date(timeString));
    (globalThis as any).viewer!.clock.currentTime = time;
  }

  // Function to focus the camera on an entity
  function focusOnEntity(entityId: string) {
    const entity = (globalThis as any).viewer?.dataSources
      .getByName("spaceaware")[0]
      ?.entities.getById(entityId.toString()) as Entity;
    
    scenario.settings.ClockSettings.shouldAnimate.set(true)
    scenario.settings.ClockSettings.multiplier.set(15);
    $trackedEntity = entity
  }

  // Function to handle cell click
  let onCellClick = function (rowIndex: number) {
    // Retrieve the entity ID from the ROW_INDICATORS array based on the row index
    const entityId = $activeEvent?.ROW_INDICATORS[rowIndex];
    if (entityId) {
      focusOnEntity(entityId);
    }
  };

  // Function to handle objectID click
  let onObjectClick = function(objectID: string) {
    console.log(objectID)
    focusOnEntity(objectID)
  }
  
  // Function to manually trigger updates (for testing)
  function triggerNextUpdate() {
    const pendingUpdate = scheduledUpdates.find(update => !update.executed);
    if (pendingUpdate) {
      console.log("Manually triggering update");
      pendingUpdate.update();
      pendingUpdate.executed = true;
    } else {
      console.log("No pending updates to trigger");
    }
  }
</script>

<div class="p-1 flex flex-col items-start justify-center min-w-[500px]">
  <div
    class="text-left flex flex-col items-start justify-between mb-4 w-full font-mono">
    <div>
      <div>NAME: {$activeEvent?.NAME}</div>
    </div>
    <div>
      <div 
        class="cursor-pointer"
        on:click={() => {
          console.log('ID clicked:', $activeEvent?.ID);
          focusOnEntity($activeEvent?.ID);
        }}>
      ID: {$activeEvent?.ID}
     </div>
    </div>
    {#key JSON.stringify($activeEvent?.PRIORITY)}
      <div class={priorityFlashing ? "priority-highlight" : ""}>
        PRIORITY: {$activeEvent?.PRIORITY} {priorityFlashing ? '(Updated)' : ''}
      </div>
    {/key}
    <div>
      <div>COUNTRY: {$activeEvent?.COUNTRY_CODE}</div>
    </div>
    <div class="cursor-pointer">
      <div on:click={() => setClockToTime($activeEvent?.EVENT_START_TIME)}>
        EVENT_TIME: {$activeEvent?.EVENT_START_TIME}
      </div>
    </div>
    
    <!-- For development testing only - remove in production -->
    <!-- {#if isDemoMode}
      <div class="mt-2">
        <button 
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
          on:click={triggerNextUpdate}>
          Trigger Next Update (Testing)
        </button>
      </div>
    {/if} -->
  </div>
  <div class="overflow-auto p-2 w-full max-h-[300px]">
    {#if $activeEvent?.COL_INDICATORS?.length}
      {#key JSON.stringify($activeEvent?.MATRIX)}
        <table class="w-full border-collapse">
          <tr>
            <th></th>

            {#each $activeEvent?.COL_INDICATORS as colIndicator}
              <th class="border px-2 whitespace-nowrap w-6 h-6"
                >{colIndicator}</th>
            {/each}
          </tr>
          {#if $activeEvent?.ROW_INDICATORS}
            {#each $activeEvent?.ROW_INDICATORS as rowIndicator, rowIndex}
              <tr>
                <th class="border px-2 w-6 h-6">{rowIndicator}</th>
                {#each $activeEvent?.COL_INDICATORS as _, colIndex}
                  <td
                    class="border text-center font-bold w-6 h-6 {getCellClass(rowIndex, colIndex)}"
                    on:click={() => onCellClick(rowIndex)}
                    >{getCellValue(rowIndex, colIndex)}</td>
                {/each}
              </tr>
            {/each}
          {/if}
          {#if extraRows > 0}
            <tr>
              <th class="border px-2"></th>
              {#each Array($activeEvent?.COL_INDICATORS?.length || 0) as _, colIndex}
                <td
                  class="border text-center font-bold w-6 h-6 {getCellClass(
                    $activeEvent?.ROW_INDICATORS?.length,
                    colIndex
                  )}">{getCellValue($activeEvent?.ROW_INDICATORS?.length, colIndex)}</td>
              {/each}
            </tr>
          {/if}
        </table>
      {/key}
    {:else}
      No COL_INDICATORS <br />
      {#if !$activeEvent?.ROW_INDICATORS?.length}
        No ROW_INDICATORS
      {/if}
    {/if}
  </div>
</div>