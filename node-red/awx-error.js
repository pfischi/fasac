const ERROR_CODES = {
    AWX_ERR_001: "Invalid or missing awx url.",
    AWX_ERR_002: "Invalid or missing awx user token.",
    AWX_ERR_003: "Job timeout is not a valid number.",
    AWX_ERR_004: "Job template id not found.",
    AWX_ERR_005: "Value extraVars is not a valid json structure.",
    AWX_ERR_006: "Job finished with errors.",
    AWX_ERR_007: "Invalid request to awx server.",      
    AWX_ERR_008: "Job not started successfully.",       
    AWX_ERR_009: "Job execution timed out.",            
    AWX_ERR_010: "Host name could not be added to inventory.",
    AWX_ERR_011: "Error getting host names.",          
  };
  
  module.exports = ERROR_CODES;
