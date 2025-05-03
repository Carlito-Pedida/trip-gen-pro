import { parseTripData } from "~/lib/utils";
import { appwriteConfig, database } from "./client";

interface Document {
  [key: string]: any;
}

type FilterByDate = (
  items: Document[],
  key: string,
  start: string,
  end?: string
) => number;

export const getUsersAndTripsStats = async (): Promise<DashboardStats> => {
  const date = new Date();
  const startCurrentDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).toISOString();

  const startPrevDate = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1
  ).toISOString();

  const endPrevDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    0
  ).toISOString();

  const [users, trips] = await Promise.all([
    database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId
    ),
    database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.tripsCollectionId
    )
  ]);

  const filterByDate: FilterByDate = (items, key, start, end) =>
    items.filter((item) => item[key] >= start && (!end || item[key] <= end))
      .length;

  const filterUsersByRole = (role: string) => {
    return users.documents.filter((user: Document) => user.status === role);
  };

  return {
    totalUsers: users.total,
    usersJoined: {
      currentMonth: filterByDate(
        users.documents,
        "joinedAt",
        startCurrentDate,
        undefined
      ),
      lastMonth: filterByDate(
        users.documents,
        "joinedAt",
        startPrevDate,
        endPrevDate
      )
    },
    userRole: {
      total: filterUsersByRole("user").length,
      currentMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startCurrentDate,
        undefined
      ),
      lastMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startPrevDate,
        endPrevDate
      )
    },
    totalTrips: trips.total,
    tripsCreated: {
      currentMonth: filterByDate(
        trips.documents,
        "createdAt",
        startCurrentDate,
        undefined
      ),
      lastMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startPrevDate,
        endPrevDate
      )
    }
  };
};

export const getUserGrowthPerDay = async () => {
  const users = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId
  );

  const userGrowth = users.documents.reduce(
    (acc: { [key: string]: number }, user: Document) => {
      const date = new Date(user.joinedAt);
      const day = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(userGrowth).map(([day, count]) => ({
    count: Number(count),
    day
  }));
};

export const getTripsCreatedPerDay = async () => {
  const trips = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.tripsCollectionId
  );

  const tripsGrowth = trips.documents.reduce(
    (acc: { [key: string]: number }, trip: Document) => {
      const date = new Date(trip.createdAt);
      const day = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(tripsGrowth).map(([day, count]) => ({
    count: Number(count),
    day
  }));
};

export const getTripsByTravelStyle = async () => {
  const trips = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.tripsCollectionId
  );

  const travelStyleCounts = trips.documents.reduce(
    (acc: { [key: string]: number }, trip: Document) => {
      const tripDetail = parseTripData(trip.tripDetail);

      if (tripDetail && tripDetail.travelStyle) {
        const travelStyle = tripDetail.travelStyle;
        acc[travelStyle] = (acc[travelStyle] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
    count: Number(count),
    travelStyle
  }));
};
