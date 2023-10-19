class Dispenser {

    /**
     * Id of the created dispenser
     */
    id?: string;

    /**
     * The flow volume of the tap, measured in liters per second
     */
    flow_volume: number;

    /**
     * Status of the dispenser (can be "open" or "close")
     */
    status?: "open" | "close";

    /**
     * Array of usages, updated every time the dispenser opens or closes
     */
    usages?: Usage[]

    constructor(flow_volume: number, id: string) {
        this.id = id;
        this.flow_volume = flow_volume;
        this.status = "close"; // "close" by default
        this.usages = [];
    }
}

interface Usage {
    opened_at: string,
    closed_at: string | null,
    flow_volume: number,
    total_spent: number
}

export { Dispenser, Usage }
