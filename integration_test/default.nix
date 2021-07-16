{ nixpkgs ? import (fetchTarball https://github.com/NixOS/nixpkgs/archive/8e4fe32876ca15e3d5eb3ecd3ca0b224417f5f17.tar.gz) { } }:

let
  k3d = nixpkgs.stdenv.mkDerivation rec {
    version = "4.4.1";
    pname = "k3d";

    src = builtins.fetchurl {
      url = "https://github.com/rancher/k3d/releases/download/v4.4.1/k3d-linux-amd64";
      sha256 = "1bjmyhf0zbi6lfq71h6vazmlkxg0b46wky5vqv1dqbkr2bdr2s24";
    };

    dontUnpack = true;

    installPhase = ''
      mkdir -p $out/bin
      cp $src $out/bin/k3d
      chmod +x $out/bin/k3d
    '';

    dontFixup = true;
  };

  skaffold = nixpkgs.buildGoModule rec {
    pname = "skaffold";
    version = "1.28.0";

    src = nixpkgs.fetchFromGitHub {
      owner = "GoogleContainerTools";
      repo = "skaffold";
      rev = "v${version}";
      sha256 = "007jq7c160m1vggib6sq1fr5m77bv9gccq8cfn8rh6sj7h57rpf4";
    };

    vendorSha256 = "0ggq6vz8na7sm37fb3xdgq161p82sfa13iz088y7whl1ip1n1wa8";

    subPackages = ["cmd/skaffold"];

    buildFlagsArray = let t = "github.com/GoogleContainerTools/skaffold/pkg/skaffold"; in  ''
      -ldflags=
        -s -w
        -X ${t}/version.version=v${version}
        -X ${t}/version.gitCommit=${src.rev}
        -X ${t}/version.buildDate=unknown
    '';

    nativeBuildInputs = [ nixpkgs.installShellFiles ];

    postInstall = ''
      installShellCompletion --cmd skaffold \
        --bash <($out/bin/skaffold completion bash) \
        --zsh <($out/bin/skaffold completion zsh)
    '';
  };

in


[
  nixpkgs.kubeconform
  nixpkgs.kubernetes-helm
  k3d
  skaffold
]
