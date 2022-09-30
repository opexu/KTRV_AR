<template>
    <div class="container relative p-4">
        <button class="rounded-md bg-indigo-600 py-2 px-3 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-indigo-500"
            v-on:click="play">PLAY</button>
    </div>
</template>

<script>
    export default {
        data: ()=>({
            
        }),
        methods:{
            play(){
                console.log("play");
                this.$router.push({ path: '/viewAR' });
            }
        }
    }
</script>
