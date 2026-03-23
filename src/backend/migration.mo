import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  type Tier = {
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

  type OldPlayer = {
    id : Nat;
    name : Text;
    tier : Tier;
    points : Nat;
    gameMode : Text;
    avatarUrl : ?Text;
  };

  type OldActor = {
    players : Map.Map<Nat, OldPlayer>;
    nextId : Nat;
    podium : [Nat];
  };

  type Entry = {
    gameMode : Text;
    tier : Tier;
  };

  type NewPlayer = {
    id : Nat;
    name : Text;
    avatarUrl : ?Text;
    entries : [Entry];
  };

  type NewActor = {
    players : Map.Map<Nat, NewPlayer>;
    nextId : Nat;
    podium : [Nat];
  };

  public func run(old : OldActor) : NewActor {
    let newPlayers = old.players.map<Nat, OldPlayer, NewPlayer>(
      func(_id, oldPlayer) {
        {
          id = oldPlayer.id;
          name = oldPlayer.name;
          avatarUrl = oldPlayer.avatarUrl;
          entries = [{
            gameMode = oldPlayer.gameMode;
            tier = oldPlayer.tier;
          }];
        };
      }
    );
    {
      players = newPlayers;
      nextId = old.nextId;
      podium = old.podium;
    };
  };
};
