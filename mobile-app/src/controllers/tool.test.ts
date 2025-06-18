import { getToolById, getToolsWithinRadius } from "./tool";
import { ObjectValidationError, NotFoundError } from "../utils/errors";
import { getCityNameFromGeopoint, distanceBetweenMi } from "../models/location"; // Assuming these are used and need mocking
import * as geofireCommon from "geofire-common"; // For mocking geohashQueryBounds
import { getDoc, getDocs, getFirestore } from "firebase/firestore"; // Importing Firestore methods directly for mocking
import { mockTimestamp } from "../../__mocks__/utils.mock";

// Mock Firestore
jest.mock("../config/firebase", () => ({
  app: {},
  auth: {},
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
  },
}));

// (getDoc as jest.Mock) = jest.fn((docRef) => {
//   // Use .path to determine which mock data to return
//   if (docRef && typeof docRef.path === "string") {
//     if (docRef.path.includes("tool")) {
//       return Promise.resolve({
//         exists: () => true,
//         id: docRef.id || "mockToolId",
//         data: () => mockValidToolData,
//       });
//     }
//     if (docRef.path.includes("user")) {
//       return Promise.resolve({
//         exists: () => true,
//         id: docRef.id || "mockUserId",
//         data: () => mockLendrUserData,
//       });
//     }
//   }
//   // Default fallback
//   return Promise.resolve({
//     exists: () => false,
//     id: docRef.id || "unknown",
//     data: () => undefined,
//   });
// });

(getDoc as jest.Mock).mockImplementation((docRef) => {
  // Use .path to determine which mock data to return
  if (docRef && typeof docRef.path === "string") {
    if (docRef.path.includes("tool")) {
      return Promise.resolve({
        exists: () => true,
        id: docRef.id || "mockToolId",
        data: () => mockValidToolData,
      });
    }
    if (docRef.path.includes("user")) {
      return Promise.resolve({
        exists: () => true,
        id: docRef.id || "mockUserId",
        data: () => mockLendrUserData,
      });
    }
  }
  // Default fallback
  return Promise.resolve({
    exists: () => false,
    id: docRef.id || "unknown",
    data: () => undefined,
  });
});

// Mock location utilities
jest.mock("../models/location", () => ({
  getCityNameFromGeopoint: jest.fn(),
  distanceBetweenMi: jest.fn(),
  metersFromMiles: jest.fn((miles) => miles * 1609.34), // Simple conversion
  getGeohashedLocation: jest.fn((geopoint) => ({
    latitude: geopoint[0],
    longitude: geopoint[1],
    geohash: "test__hash", // Simplified mock
    city: "Mock City", // Added based on ToolModelSchema
    state: "MS",
    zipCode: "12345",
    address: "123 Mock St",
  })),
}));

// Mock geofire-common
jest.mock("geofire-common", () => ({
  geohashQueryBounds: jest.fn(),
  distanceBetween: jest.fn(), // if used directly by the controller
}));

// Shared mock data
const validToolId = "validTool123";
const mockValidToolData = {
  name: "Test Tool",
  brand: "TestBrand",
  description: "A great tool for testing",
  imageUrls: ["http://example.com/image.png"],
  lenderUid: "lender123",
  holderUid: "lender123",
  createdAt: mockTimestamp(),
  modifiedAt: mockTimestamp(),
  rate: { price: 10, timeUnit: "day" },
  preferences: { delivery: true, localPickup: false, useOnSite: false },
  location: {
    address: "123 Test St",
    city: "Testville",
    state: "TS",
    zipCode: "12345",
    geopoint: { latitude: 30.0, longitude: -90.0 }, // Matches LendrLocationSchema
    geohash: "test__hash", // Added based on ToolModelSchema -> LendrLocationSchema -> getGeohashedLocation
    latitude: 30.0, // Added for direct access if needed
    longitude: -90.0, // Added for direct access if needed
  },
  visibility: "published",
  // id is not part of the Firestore document data itself
};

const mockLendrUserData = {
  uid: "lender123",
  displayName: "Test Lender",
  firstName: "Test",
  lastName: "Lender",
  photoURL: "http://example.com/lender.png",
  expoPushTokens: [],
  createdAt: mockTimestamp(),
  relations: []
  // other fields as per LendrUserPreviewSchema if needed by controller logic beyond validation
};

describe("Tool Controller", () => {
  beforeEach(() => {
    // jest.clearAllMocks(); // Clear mocks before each test
    // // Default mock for getDoc (can be overridden in specific tests)
    // (getDoc as jest.Mock).mockResolvedValue({ exists: () => false, data: () => undefined });
  });
  it("should pass", () => {
    expect(true).toBe(true); // Placeholder test to ensure setup is correct
  });
});

describe("getToolById", () => {
  it("should return a validated tool when given a valid ID and data", async () => {
    // Arrange

    (getCityNameFromGeopoint as jest.Mock).mockResolvedValue("Testville, TS");

    // Act
    const tool = await getToolById(validToolId);

    // Assert
    expect(getDoc).toHaveBeenCalledTimes(3);
    expect(tool).toBeDefined();
    expect(tool?.id).toBe(validToolId);
    expect(tool?.name).toBe(mockValidToolData.name);
    expect(tool?.lender?.uid).toBe(mockLendrUserData.uid); // Check populated lender
  });

  it("should throw NotFoundError if tool document does not exist", async () => {
    // Arrange
    (getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });

    // Act & Assert
    await expect(getToolById("nonExistentId")).rejects.toThrow(NotFoundError);
  });

  it("should throw NotFoundError if tool data is undefined (though exists is true - edge case)", async () => {
    // Arrange
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      id: "someId",
      data: () => undefined,
    });

    // Act & Assert
    await expect(getToolById("someId")).rejects.toThrow(NotFoundError);
  });

  it("should throw ObjectValidationError if tool data is invalid", async () => {
    // Arrange
    const invalidToolData = { ...mockValidToolData, name: undefined }; // name is required
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      id: validToolId,
      data: () => invalidToolData,
    });
    // No need to mock lender getDoc for this test as it should fail before that

    // Act & Assert
    await expect(getToolById(validToolId)).rejects.toThrow(
      ObjectValidationError
    );
  });

  it("should throw NotFoundError if lender document does not exist", async () => {
    // Arrange
    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        // Tool document
        exists: () => true,
        id: validToolId,
        data: () => mockValidToolData,
      })
      .mockResolvedValueOnce({
        // Lender document - does not exist
        exists: () => false,
      });

    // Act & Assert
    await expect(getToolById(validToolId)).rejects.toThrow(NotFoundError);
    expect((getDoc as jest.Mock).mock.calls[1][0].path).toBe(
      `users/${mockValidToolData.lenderUid}`
    );
  });
});

// Placeholder for getToolsWithinRadius tests
describe("getToolsWithinRadius", () => {
  const mockCenter: [number, number] = [30.0, -90.0];
  const mockRadiusMi = 10;

  beforeEach(() => {
    (geofireCommon.geohashQueryBounds as jest.Mock).mockReturnValue([
      ["dpz8abc", "dpz8xyz"],
    ]); // Mock bounds
    (distanceBetweenMi as jest.Mock).mockReturnValue(mockRadiusMi / 2); // Assume all tools are within radius by default
  });

  it("should return valid tools within radius", async () => {
    const tool1 = {
      ...mockValidToolData,
      name: "Tool 1",
      location: {
        ...mockValidToolData.location,
        latitude: 30.001,
        longitude: -90.001,
      },
    };
    const tool2 = {
      ...mockValidToolData,
      name: "Tool 2",
      location: {
        ...mockValidToolData.location,
        latitude: 30.002,
        longitude: -90.002,
      },
    };
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [
        { id: "tool1", data: () => tool1, exists: () => true },
        { id: "tool2", data: () => tool2, exists: () => true },
      ],
    });

    const tools = await getToolsWithinRadius(mockRadiusMi, mockCenter);
    expect(tools).toBeDefined();
    expect(tools?.length).toBe(2);
    expect(tools?.[0].name).toBe("Tool 1");
    expect(getDocs).toHaveBeenCalledTimes(1); // Assuming one bound for simplicity in this test
  });

  it("should skip tools with invalid data and log errors", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const validTool = { ...mockValidToolData, name: "Valid Tool" };
    const invalidTool = {
      ...mockValidToolData,
      name: undefined,
      description: "Missing name",
    }; // Invalid: name is undefined

    (getDocs as jest.Mock).mockResolvedValue({
      docs: [
        { id: "valid1", data: () => validTool, exists: () => true },
        { id: "invalid1", data: () => invalidTool, exists: () => true },
      ],
    });

    const tools = await getToolsWithinRadius(mockRadiusMi, mockCenter);
    expect(tools).toBeDefined();
    expect(tools?.length).toBe(1);
    expect(tools?.[0].name).toBe("Valid Tool");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Validation failed for tool:"),
      "invalid1",
      expect.anything()
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Skipping tool with id invalid1 due to validation error."
      )
    );

    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("should return an empty array if no tools are found", async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
    const tools = await getToolsWithinRadius(mockRadiusMi, mockCenter);
    expect(tools).toEqual([]);
  });

  it("should skip tools if their document data is undefined", async () => {
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [{ id: "nodata1", data: () => undefined, exists: () => true }],
    });

    const tools = await getToolsWithinRadius(mockRadiusMi, mockCenter);
    expect(tools).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Document data is undefined for a document in snapshot, skipping."
      )
    );
    consoleWarnSpy.mockRestore();
  });
});

// Example of more specific mock tool data for tests if needed:
const sampleToolData1 = {
  name: "Hammer",
  brand: "Stanley",
  description: "A sturdy hammer.",
  imageUrls: ["url1"],
  lenderUid: "user1",
  holderUid: "user1",
  createdAt: mockTimestamp(new Date(1670000000)),
  modifiedAt: mockTimestamp(new Date(1670000000)),
  rate: { price: 5, timeUnit: "day" },
  preferences: { delivery: false, localPickup: true, useOnSite: true },
  location: {
    address: "1 Main St",
    city: "Anytown",
    state: "AN",
    zipCode: "10001",
    geopoint: { latitude: 40.7128, longitude: -74.006 },
    latitude: 40.7128,
    longitude: -74.006,
    geohash: "dr5reg",
  },
  visibility: "published",
};
const sampleToolDataInvalid = {
  // Missing 'name', 'lenderUid', 'holderUid', 'createdAt', 'modifiedAt', 'rate', 'preferences', 'location', 'visibility'
  brand: "Unknown",
  description: "This tool data is incomplete.",
  imageUrls: [],
};
