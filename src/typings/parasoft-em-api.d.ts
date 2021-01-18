interface EMEnvironment {
    id: number;
    name: string;
    systemId: number;
    version?: string;
    description?: string;
}

interface EMEnvironmentCopyResult {
    id: number;
    originalEnvId: number;
    environmentId?: number;
    status: string;
    message?: string;
    expire?: number;
    deployFailures?: string[];
    copiedCount?: {
        totalActionCount?: number;
        copiedActionCount?: number;
        totalAssetCount?: number;
        copiedAssetCount?: number;
        totalMessageProxyCount?: number;
        copiedMessageProxyCount?: number;
    };
    componentEndpoints?: any[];
}

interface EMEnvironmentInstance {
    id: number;
    name: string;
}

interface EMJob {
    id: number;
    name: string;
    fork?: boolean;
    historyCountLimit?: number;
    historyDaysLimit?: number;
    testConfiguration?: string;
    context?: {
        systemId: number;
        environmentId: number;
        environmentInstanceId: number;
    }
    testScenarioInstances: EMTestScenarioInstance[];
}

interface EMJobHistory {
    id: number;
    startTime?: number;
    status?: string;
    username?: string;
    completionTime?: number;
    percentage?: number;
    jobId?: number;
    jobName?: string;
    context?: {
        systemId: number;
        environmentId: number;
        environmentInstanceId: number;
    }
    testHistories?: any[];
    reportIds?: number[];
    testExecutionIds?:  string[];
}

interface EMProvisionResult {
    eventId: number;
    environmentId: number;
    instanceId: number;
    abortOnFailure: boolean;
    status: string;
    steps: EMProvisionStep[];
}

interface EMProvisionStep {
    stepId: number;
    name: string;
    description?: string;
    result: string;
    percent?: number;
}

interface EMSystem {
    id: number;
    name: string;
    version?: string;
    description?: string;
}

interface EMTestScenarioInstance {
    id: number;
    priority?: number;
    testScenarioId: number;
    variableSet?: string;
    variables: any[];
    dataSourceRows?: {
        dataSource?: string;
        rows: string;
    }
}

interface VirtServer {
    id: number;
    name?: string;
    host?: string;
    port?: number;
    status?: string;
}
