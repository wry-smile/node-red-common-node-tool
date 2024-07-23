interface InstallNodesItemType {
  packageName: string
  version: string
}

const installNodes: InstallNodesItemType[] = [
  {
    packageName: 'node-red-contrib-bacnet',
    version: '0.3.0',
  },
  {
    packageName: 'node-red-contrib-interval-multiples-timer',
    version: '1.0.5',
  },
  {
    packageName: 'node-red-contrib-mcprotocol',
    version: '1.2.1',
  },
  {
    packageName: 'node-red-contrib-mcprotocol-ind',
    version: '1.7.0',
  },
  {
    packageName: 'node-red-contrib-modbus',
    version: '5.40.0',
  },
  {
    packageName: 'node-red-contrib-omron-fins',
    version: '0.5.0',
  },
  {
    packageName: 'node-red-contrib-opcua',
    version: '0.2.331',
  },
  {
    packageName: 'node-red-contrib-s7',
    version: '3.1.0',
  },
  {
    packageName: 'node-red-node-ping',
    version: '0.3.3',
  },
  {
    packageName: 'node-red-node-random',
    version: '0.4.1',
  },
]

export {
  installNodes,
  InstallNodesItemType,
}
