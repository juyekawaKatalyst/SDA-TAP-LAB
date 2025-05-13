export default [
  {
    "id": "hyp1001",
    "timestamp": 1723559600000,
    "headers": {
      "x-client-dn": "CN=Anomaly Hypothesis, KST=Hypothesis,OU=Services,O=Katalyst Space Technologies"
    },
    "HYPCOLLECTION": {
      "RECORDS": [
        {
          "ID": "63604",
          "NAME": "SHIYAN 27F",
          "CATEGORY": "SATELLITE_STATUS",
          "COUNTRY_CODE": "CN",
          "ANALYSIS_METHOD": "Orbital Pattern Analysis",
          "EVENT_START_TIME": "2025-05-17T00:47:00.000Z",
          "EVENT_END_TIME": "2025-05-17T00:50:00.000Z",
          "PRIORITY": "4",
          "DEMO": true,
          "CAT_IDS": [
            "54824"  // FENGYUN 2F only - this should be the actual entity ID in the viewer
          ],
          "SIT_IDS": [
            "situation-fengyun-monitoring"
          ],
          "ROW_INDICATORS": [
            "Indicator Flag",  
            
          ],
          "COL_INDICATORS": [
            "ORB",
            "VMAG",
            "AMR",
            "TC",
            "LV_LS",
            "DeltaV",
            "AGE"
          ],
          "MATRIX": [
            // Row 0: FENGYUN (entity 37872) status indicators
            true, null, null, null, true, false, true,
          
          
          ],
          "SCORE": [
            {
              "OBJECT_ID": "37872", 
              "VALUE": 0.78,
              "CONFIDENCE": 0.93,
              "ALGORITHM": "SYSTEM_STATUS_ANALYSIS"
            }
          ]
        }
      ]
    }
  },
  
]