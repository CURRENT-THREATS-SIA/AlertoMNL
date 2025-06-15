import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

export async function loadGraphData() {
  console.log('loadGraphData called');
  try {
    const nodesAsset = Asset.fromModule(require('../../assets/graphNodes.json'));
    const edgesAsset = Asset.fromModule(require('../../assets/graphEdges.json'));

    await nodesAsset.downloadAsync();
    await edgesAsset.downloadAsync();

    console.log('nodesAsset', nodesAsset);
    console.log('edgesAsset', edgesAsset);

    if (!nodesAsset.localUri || !edgesAsset.localUri) {
      throw new Error('Asset localUri not found. Check asset bundling and paths.');
    }

    const nodesString = await FileSystem.readAsStringAsync(nodesAsset.localUri);
    const edgesString = await FileSystem.readAsStringAsync(edgesAsset.localUri);

    return {
      graphNodes: JSON.parse(nodesString),
      graphEdges: JSON.parse(edgesString),
    };
  } catch (e) {
    console.log('loadGraphData error', e);
    throw e;
  }
}
