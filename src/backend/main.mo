import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import List "mo:core/List";

actor {
  // Player Type and Tier
  type Tier = {
    #s;
    #a;
    #b;
    #c;
    #d;
  };

  type Player = {
    id : Nat;
    name : Text;
    tier : Tier;
    points : Nat;
    gameMode : Text;
    avatarUrl : ?Text;
  };

  module Player {
    // Compare players by points descending (highest points first)
    public func compare(player1 : Player, player2 : Player) : Order.Order {
      Nat.compare(player2.points, player1.points);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let players = Map.empty<Nat, Player>();
  var nextId = 1;

  // Podium structure: array of 3 player ids
  var podium : [Nat] = [0, 0, 0];

  public shared ({ caller }) func addPlayer(player : Player) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add players");
    };
    let newPlayer : Player = {
      player with
      id = nextId;
    };
    players.add(nextId, newPlayer);
    nextId += 1;
    newPlayer.id;
  };

  public query ({ caller }) func getPlayer(id : Nat) : async Player {
    // Public access - no authorization check needed
    switch (players.get(id)) {
      case (?player) { player };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  public query ({ caller }) func getAllPlayers() : async [Player] {
    // Public access - no authorization check needed
    players.values().toArray();
  };

  public query ({ caller }) func getTop3Players() : async [Player] {
    // Public access - no authorization check needed
    let playerEntries = players.entries().toArray();
    if (playerEntries.size() < 3) {
      return players.values().toArray();
    };

    let sortedPlayers = playerEntries
      .map(func((id, player)) { player })
      .sort();

    sortedPlayers.sliceToArray(0, 3);
  };

  public shared ({ caller }) func updatePlayer(id : Nat, player : Player) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update players");
    };
    if (not players.containsKey(id)) { Runtime.trap("Player not found") };
    let updatedPlayer : Player = {
      player with id
    };
    players.add(id, updatedPlayer);
  };

  public shared ({ caller }) func deletePlayer(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete players");
    };
    if (not players.containsKey(id)) { Runtime.trap("Player not found") };
    players.remove(id);
  };

  public shared ({ caller }) func setPodium(first : Nat, second : Nat, third : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set the podium");
    };
    podium := [first, second, third];
  };

  public query ({ caller }) func getPodium() : async [Player] {
    // Public access - no authorization check needed
    let playerIds = podium;
    let podiumList = List.empty<Player>();
    for (id in playerIds.values()) {
      switch (players.get(id)) {
        case (?player) { podiumList.add(player) };
        case (null) {};
      };
    };
    podiumList.toArray();
  };

  public query ({ caller }) func getPlayersByTier(tier : Tier) : async [Player] {
    // Public access - no authorization check needed
    let filteredPlayers = players.values().toArray().filter(
      func(player) { player.tier == tier }
    );
    filteredPlayers.sort();
  };

  // Sample Data Seed
  public shared ({ caller }) func seedSampleData() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can seed sample data");
    };

    let samplePlayers : [Player] = [
      { id = 0; name = "AwesomePro"; tier = #s; points = 1500; gameMode = "Survival"; avatarUrl = ?"avatar1.png" },
      { id = 0; name = "Builder1"; tier = #a; points = 1200; gameMode = "Creative"; avatarUrl = ?"avatar2.png" },
      { id = 0; name = "CasualGamer"; tier = #b; points = 900; gameMode = "Survival"; avatarUrl = ?"avatar3.png" },
      { id = 0; name = "ChillPlayer"; tier = #c; points = 600; gameMode = "Survival"; avatarUrl = ?"avatar4.png" },
      { id = 0; name = "Newbie"; tier = #d; points = 300; gameMode = "Survival"; avatarUrl = ?"avatar5.png" },
    ];

    for (player in samplePlayers.values()) {
      let newPlayer : Player = {
        player with
        id = nextId;
      };
      players.add(nextId, newPlayer);
      nextId += 1;
    };
  };
};
