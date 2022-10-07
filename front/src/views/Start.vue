<template>
    <div class="w-full h-full">
        <div class="container relative p-4 space-y-4 flex flex-col justify-center items-center">
            <!-- <button class="rounded-md bg-indigo-600 py-2 px-3 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-indigo-500"
                v-on:click="enterMindAR"
            >MindAR
            </button> -->
            <button class="rounded-md bg-indigo-600 py-2 px-3 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-indigo-500"
                v-on:click="enterARJS"
            >ARJS
            </button>
            <button class="rounded-md bg-indigo-600 py-2 px-3 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-indigo-500"
                v-on:click="enterNFT"
            >NFT
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        data: ()=>({
            
        }),
        methods:{
            enterMindAR(){
                console.log("mindar");
                this.$router.push({ path: '/viewAR' });
            },
            enterARJS(){
                console.log("arjs");
                this.$router.push({ path: '/arjs' });
            },
            enterNFT(){
                console.log("nft");
                this.$router.push({ path: '/nft' });
            }
        }
    }
</script>
