import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration function in with-clause

actor {
  // Tier enums (ht1 is highest, lt5 is lowest)
  public type Tier = {
    #ht1;
    #lt1;
    #ht2;
    #lt2;
    #ht3;
    #lt3;
    #ht4;
    #lt4;
    #ht5;
    #lt5;
  };

  // Helper to get tier rank (1 = best, 10 = worst)
  func tierRank(t : Tier) : Nat {
    switch (t) {
      case (#ht1) { 1 };
      case (#lt1) { 2 };
      case (#ht2) { 3 };
      case (#lt2) { 4 };
      case (#ht3) { 5 };
      case (#lt3) { 6 };
      case (#ht4) { 7 };
      case (#lt4) { 8 };
      case (#ht5) { 9 };
      case (#lt5) { 10 };
    };
  };

  // GameModeEntry type
  public type GameModeEntry = {
    gameMode : Text;
    tier : Tier;
  };

  // Player record type
  public type Player = {
    id : Nat;
    name : Text;
    avatarUrl : ?Text;
    entries : [GameModeEntry];
  };

  // Helper to find best tier for a player
  func bestTier(player : Player) : ?GameModeEntry {
    if (player.entries.size() == 0) {
      return null;
    };
    var best = player.entries[0];
    for (entry in player.entries.values()) {
      if (tierRank(entry.tier) < tierRank(best.tier)) {
        best := entry;
      };
    };
    ?best;
  };

  // Compare players by best tier rank (ascending = best first)
  func comparePlayersByBestTier(p1 : Player, p2 : Player) : Order.Order {
    let best1 = bestTier(p1);
    let best2 = bestTier(p2);
    switch (best1, best2) {
      case (null, null) { #equal };
      case (null, _) { #greater };
      case (_, null) { #less };
      case (?b1, ?b2) {
        Nat.compare(tierRank(b1.tier), tierRank(b2.tier));
      };
    };
  };

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let players = Map.empty<Nat, Player>();
  var nextId : Nat = 1;

  // Podium structure: array of 3 player ids (1st, 2nd, 3rd)
  var podium : [Nat] = [0, 0, 0];

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  /// --- User Profile Management ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /// --- Player Management ---

  // Admin-only function to add a new player
  public shared ({ caller }) func addPlayer(
    name : Text,
    entries : [GameModeEntry],
    avatarUrl : Text, // Empty string means no avatar
  ) : async Nat {
    // Authorization check (admin only)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add players");
    };

    let id = nextId;
    let newPlayer : Player = {
      id;
      name;
      avatarUrl = if (avatarUrl == "") { null } else { ?avatarUrl };
      entries;
    };
    players.add(id, newPlayer);
    nextId += 1;
    id;
  };

  // Admin-only function to update an existing player
  public shared ({ caller }) func updatePlayer(
    id : Nat,
    name : Text,
    entries : [GameModeEntry],
    avatarUrl : Text,
  ) : async Bool {
    // Authorization check (admin only)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update players");
    };

    switch (players.get(id)) {
      case (null) { false };
      case (?_) {
        let updatedPlayer : Player = {
          id;
          name;
          avatarUrl = if (avatarUrl == "") { null } else { ?avatarUrl };
          entries;
        };
        players.add(id, updatedPlayer);
        true;
      };
    };
  };

  // Admin-only function to delete a player
  public shared ({ caller }) func deletePlayer(id : Nat) : async Bool {
    // Authorization check (admin only)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete players");
    };

    if (not players.containsKey(id)) {
      return false;
    };
    players.remove(id);
    true;
  };

  // Admin-only function to delete all players (reset leaderboard)
  public shared ({ caller }) func deleteAllPlayers() : async () {
    // Authorization check (admin only)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete all players");
    };
    players.clear();
    nextId := 1;
  };

  /// --- Player Queries ---

  // Public function to get all players (sorted by best tier)
  public query func getAllPlayers() : async [Player] {
    let playersArray = players.values().toArray();
    playersArray.sort(comparePlayersByBestTier);
  };

  // Public function to get top n players by best tier
  public query func getTopPlayers(n : Nat) : async [Player] {
    let playersArray = players.values().toArray();
    let sortedPlayers = playersArray.sort(comparePlayersByBestTier);
    if (n >= sortedPlayers.size()) {
      return sortedPlayers;
    };
    sortedPlayers.sliceToArray(0, n);
  };

  // Admin-only sample data seeder
  public shared ({ caller }) func seedSamplePlayers() : async () {
    // Authorization check (admin only)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed sample players");
    };

    // Sample players with multiple game mode entries each
    let sampleData : [(Text, [GameModeEntry], Text)] = [
      ("TechnoGamer", [{ gameMode = "CrystalPvP"; tier = #ht1 }, { gameMode = "UHC"; tier = #lt1 }], "avatar1.png"),
      ("SwordMaster", [{ gameMode = "Sword"; tier = #ht1 }, { gameMode = "CrystalPvP"; tier = #ht2 }, { gameMode = "UHC"; tier = #lt2 }], "avatar2.png"),
      ("CasualPro", [{ gameMode = "UHC"; tier = #ht2 }, { gameMode = "Sword"; tier = #lt2 }], "avatar3.png"),
      ("MidTierPlayer", [{ gameMode = "CrystalPvP"; tier = #ht3 }, { gameMode = "Sword"; tier = #lt3 }], "avatar4.png"),
      ("BeginnerJoe", [{ gameMode = "UHC"; tier = #lt5 }, { gameMode = "Sword"; tier = #ht5 }], "avatar5.png"),
    ];

    for ((name, entries, avatar) in sampleData.values()) {
      let newPlayer : Player = {
        id = nextId;
        name;
        avatarUrl = ?avatar;
        entries;
      };
      players.add(nextId, newPlayer);
      nextId += 1;
    };
  };

  // Public function to get all players by tier
  public query func getPlayersByTier(tier : Tier) : async [Player] {
    let filteredPlayers = players.values().toArray().filter(
      func(player) {
        player.entries.any(func(entry) { entry.tier == tier });
      }
    );
    filteredPlayers.sort(comparePlayersByBestTier);
  };

  /// --- Podium / Top 3 ---

  // Public function to get the current podium (top 3 players by stored ids)
  public query func getPodium() : async [Player] {
    let resultList = List.empty<Player>();
    for (id in podium.values()) {
      switch (players.get(id)) {
        case (?player) { resultList.add(player) };
        case (null) {};
      };
    };
    resultList.toArray();
  };

  // Admin-only function to set the current podium
  public shared ({ caller }) func setPodium(firstId : Nat, secondId : Nat, thirdId : Nat) : async () {
    // Authorization check (admin only)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the podium");
    };
    podium := [firstId, secondId, thirdId];
  };
};
