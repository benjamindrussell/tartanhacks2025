let cachedWorkflows = [];

const updateWorkflowCache = (workflow) => {
    cachedWorkflows = cachedWorkflows.filter(w => w.action !== workflow.action);
    cachedWorkflows.push({
        ...workflow.toObject(),
        active: false
    });
    console.log(`Updated workflow cache. Total workflows: ${cachedWorkflows.length}`);
};

const loadWorkflows = async (Workflow) => {
    try {
        const workflows = await Workflow.find({});
        cachedWorkflows = workflows.map(w => ({
            ...w.toObject(),
            active: false
        }));
        console.log(`Loaded ${cachedWorkflows.length} workflows from database`);
    } catch (error) {
        console.error("Error loading workflows:", error);
    }
};

module.exports = {
    updateWorkflowCache,
    loadWorkflows,
    getCachedWorkflows: () => cachedWorkflows
}; 